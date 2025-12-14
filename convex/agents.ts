import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const AGENT_EMOJIS = [
    "👨‍🚀", "👩‍🔬", "🧙‍♂️", "🧝‍♀️", "🦸‍♂️", "🦹‍♀️", "👨‍🌾", "👩‍🍳",
    "🤖", "👻", "🧛", "🧟", "🎅", "🧙", "👸", "🤴"
];

const PERSONALITIES = [
    "Curious and adventurous, always looking for new discoveries",
    "Cautious and analytical, thinks before acting",
    "Friendly and social, loves meeting other agents",
    "Competitive and ambitious, wants to collect the most items",
    "Peaceful and contemplative, prefers solitude",
    "Helpful and generous, shares items with others",
    "Mischievous and playful, likes to surprise others",
    "Wise and philosophical, ponders the meaning of existence"
];

export const createAgent = mutation({
    args: {
        worldId: v.id("worlds"),
        name: v.string(),
        personality: v.optional(v.string()),
        emoji: v.optional(v.string()),
        x: v.optional(v.number()),
        y: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const world = await ctx.db.get(args.worldId);
        if (!world) {
            throw new Error("World not found");
        }

        const agentId = await ctx.db.insert("agents", {
            worldId: args.worldId,
            name: args.name,
            personality: args.personality ?? PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)],
            x: args.x ?? Math.floor(Math.random() * world.gridWidth),
            y: args.y ?? Math.floor(Math.random() * world.gridHeight),
            emoji: args.emoji ?? AGENT_EMOJIS[Math.floor(Math.random() * AGENT_EMOJIS.length)],
            inventory: [],
            currentThought: "I just appeared in this world. Let me look around...",
            memory: "",
            createdAt: Date.now(),
        });

        // Add spawn log
        await ctx.db.insert("logs", {
            worldId: args.worldId,
            agentId,
            message: `${args.name} appeared in the world`,
            type: "system",
            timestamp: Date.now(),
        });

        return agentId;
    },
});

export const getAgentsByWorld = query({
    args: { worldId: v.id("worlds") },
    handler: async (ctx, args) => {
        const agents = await ctx.db
            .query("agents")
            .withIndex("by_world", (q) => q.eq("worldId", args.worldId))
            .collect();
        return agents;
    },
});

export const getAgent = query({
    args: { agentId: v.id("agents") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.agentId);
    },
});

export const updateAgent = mutation({
    args: {
        agentId: v.id("agents"),
        x: v.optional(v.number()),
        y: v.optional(v.number()),
        currentThought: v.optional(v.string()),
        memory: v.optional(v.string()),
        inventory: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const { agentId, ...updates } = args;

        const agent = await ctx.db.get(agentId);
        if (!agent) {
            throw new Error("Agent not found");
        }

        await ctx.db.patch(agentId, updates);
    },
});

export const moveAgent = mutation({
    args: {
        agentId: v.id("agents"),
        direction: v.union(
            v.literal("UP"),
            v.literal("DOWN"),
            v.literal("LEFT"),
            v.literal("RIGHT"),
            v.literal("STAY")
        ),
    },
    handler: async (ctx, args) => {
        const agent = await ctx.db.get(args.agentId);
        if (!agent) {
            throw new Error("Agent not found");
        }

        const world = await ctx.db.get(agent.worldId);
        if (!world) {
            throw new Error("World not found");
        }

        let newX = agent.x;
        let newY = agent.y;

        switch (args.direction) {
            case "UP":
                newY = Math.max(0, agent.y - 1);
                break;
            case "DOWN":
                newY = Math.min(world.gridHeight - 1, agent.y + 1);
                break;
            case "LEFT":
                newX = Math.max(0, agent.x - 1);
                break;
            case "RIGHT":
                newX = Math.min(world.gridWidth - 1, agent.x + 1);
                break;
            case "STAY":
                break;
        }

        if (newX !== agent.x || newY !== agent.y) {
            await ctx.db.patch(args.agentId, { x: newX, y: newY });

            await ctx.db.insert("logs", {
                worldId: agent.worldId,
                agentId: args.agentId,
                message: `${agent.name} moved ${args.direction.toLowerCase()}`,
                type: "action",
                timestamp: Date.now(),
            });
        }

        return { x: newX, y: newY };
    },
});

export const deleteAgent = mutation({
    args: { agentId: v.id("agents") },
    handler: async (ctx, args) => {
        const agent = await ctx.db.get(args.agentId);
        if (!agent) {
            throw new Error("Agent not found");
        }

        await ctx.db.insert("logs", {
            worldId: agent.worldId,
            message: `${agent.name} left the world`,
            type: "system",
            timestamp: Date.now(),
        });

        await ctx.db.delete(args.agentId);
    },
});
