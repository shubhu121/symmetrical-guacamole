import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { geminiFlash, createAgentPrompt, parseAgentResponse } from "@/lib/gemini";
import { getNearbyEntities } from "@/lib/game-engine";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
    try {
        const { worldId } = await request.json();

        if (!worldId) {
            return NextResponse.json({ error: "Missing worldId" }, { status: 400 });
        }

        // Get world state
        const world = await convex.query(api.worlds.getWorld, {
            worldId: worldId as Id<"worlds">
        });

        if (!world) {
            return NextResponse.json({ error: "World not found" }, { status: 404 });
        }

        if (world.status !== "running") {
            return NextResponse.json({ error: "World is paused" }, { status: 400 });
        }

        // Get all agents
        const agents = await convex.query(api.agents.getAgentsByWorld, {
            worldId: worldId as Id<"worlds">
        });

        if (agents.length === 0) {
            return NextResponse.json({ message: "No agents to process" });
        }

        // Get all items
        const items = await convex.query(api.items.getItemsByWorld, {
            worldId: worldId as Id<"worlds">
        });

        // Get recent logs for context
        const logs = await convex.query(api.logs.getLogsByWorld, {
            worldId: worldId as Id<"worlds">,
            limit: 10,
        });

        const recentEvents = logs.map((log) => log.message);

        // Process each agent
        const results = await Promise.all(
            agents.map(async (agent) => {
                try {
                    // Get nearby entities (within 5 tiles)
                    const nearbyAgents = getNearbyEntities(agent, agents, 5);
                    const nearbyItems = getNearbyEntities(agent, items, 3);

                    // Create prompt
                    const prompt = createAgentPrompt(
                        {
                            name: agent.name,
                            personality: agent.personality,
                            x: agent.x,
                            y: agent.y,
                            inventory: agent.inventory,
                            memory: agent.memory,
                        },
                        {
                            gridWidth: world.gridWidth,
                            gridHeight: world.gridHeight,
                            nearbyAgents: nearbyAgents.map((a) => ({
                                name: a.name,
                                x: a.x,
                                y: a.y,
                                emoji: a.emoji,
                            })),
                            nearbyItems: nearbyItems.map((i) => ({
                                name: i.name,
                                x: i.x,
                                y: i.y,
                                emoji: i.emoji,
                            })),
                            recentEvents,
                        }
                    );

                    // Call Gemini
                    const result = await geminiFlash.generateContent(prompt);
                    const response = result.response.text();

                    // Parse response
                    const decision = parseAgentResponse(response);

                    if (!decision) {
                        // Fallback: random movement
                        await convex.mutation(api.agents.moveAgent, {
                            agentId: agent._id,
                            direction: ["UP", "DOWN", "LEFT", "RIGHT"][Math.floor(Math.random() * 4)] as any,
                        });
                        await convex.mutation(api.agents.updateAgent, {
                            agentId: agent._id,
                            currentThought: "I'm feeling indecisive...",
                        });
                        return { agentId: agent._id, status: "fallback" };
                    }

                    // Execute decision
                    switch (decision.action) {
                        case "MOVE":
                            if (decision.direction) {
                                await convex.mutation(api.agents.moveAgent, {
                                    agentId: agent._id,
                                    direction: decision.direction,
                                });
                            }
                            break;

                        case "SPEAK":
                            if (decision.speech) {
                                await convex.mutation(api.logs.addLog, {
                                    worldId: worldId as Id<"worlds">,
                                    agentId: agent._id,
                                    message: `${agent.name}: "${decision.speech}"`,
                                    type: "speech",
                                });
                            }
                            break;

                        case "PICKUP":
                            // Find item at agent's position
                            const itemAtPosition = items.find(
                                (i) => i.x === agent.x && i.y === agent.y
                            );
                            if (itemAtPosition) {
                                await convex.mutation(api.items.pickupItem, {
                                    agentId: agent._id,
                                    itemId: itemAtPosition._id,
                                });
                            }
                            break;

                        case "STAY":
                            // Do nothing, just update thought
                            break;
                    }

                    // Update thought
                    await convex.mutation(api.agents.updateAgent, {
                        agentId: agent._id,
                        currentThought: decision.thought,
                    });

                    return { agentId: agent._id, status: "success", decision };
                } catch (error) {
                    console.error(`Error processing agent ${agent.name}:`, error);
                    return { agentId: agent._id, status: "error", error: String(error) };
                }
            })
        );

        // Increment tick counter
        const newTick = await convex.mutation(api.worlds.incrementTick, {
            worldId: worldId as Id<"worlds">
        });

        return NextResponse.json({
            success: true,
            tick: newTick,
            results,
        });
    } catch (error) {
        console.error("Game tick error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
