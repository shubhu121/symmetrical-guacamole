import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Get the flash model for speed/cost efficiency
export const geminiFlash = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 256,
    },
});

// Get the pro model for complex reasoning
export const geminiPro = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 512,
    },
});

// Agent decision response type
export interface AgentDecision {
    action: "MOVE" | "STAY" | "SPEAK" | "PICKUP";
    direction?: "UP" | "DOWN" | "LEFT" | "RIGHT";
    speech?: string;
    thought: string;
}

// Create the prompt for an agent's decision
export function createAgentPrompt(
    agent: {
        name: string;
        personality: string;
        x: number;
        y: number;
        inventory: string[];
        memory: string;
    },
    context: {
        gridWidth: number;
        gridHeight: number;
        nearbyAgents: Array<{ name: string; x: number; y: number; emoji: string }>;
        nearbyItems: Array<{ name: string; x: number; y: number; emoji: string }>;
        recentEvents: string[];
    }
): string {
    const nearbyAgentsStr = context.nearbyAgents.length > 0
        ? context.nearbyAgents.map(a => `${a.name} at (${a.x}, ${a.y})`).join(", ")
        : "None nearby";

    const nearbyItemsStr = context.nearbyItems.length > 0
        ? context.nearbyItems.map(i => `${i.emoji} ${i.name} at (${i.x}, ${i.y})`).join(", ")
        : "None nearby";

    const inventoryStr = agent.inventory.length > 0
        ? agent.inventory.join(", ")
        : "Empty";

    const eventsStr = context.recentEvents.length > 0
        ? context.recentEvents.join("\n")
        : "Nothing notable";

    return `You are ${agent.name}, an AI agent in a simulation world.

YOUR PERSONALITY:
${agent.personality}

YOUR CURRENT STATE:
- Position: (${agent.x}, ${agent.y})
- Grid size: ${context.gridWidth}x${context.gridHeight}
- Inventory: ${inventoryStr}

WHAT YOU SEE:
- Nearby agents: ${nearbyAgentsStr}
- Nearby items: ${nearbyItemsStr}

RECENT EVENTS:
${eventsStr}

${agent.memory ? `YOUR MEMORIES:\n${agent.memory}` : ""}

INSTRUCTIONS:
Decide your next action based on your personality and surroundings.
You can: MOVE (in a direction), STAY (in place), SPEAK (say something), or PICKUP (grab a nearby item).

Respond with ONLY valid JSON in this exact format:
{
  "action": "MOVE" | "STAY" | "SPEAK" | "PICKUP",
  "direction": "UP" | "DOWN" | "LEFT" | "RIGHT" (only if action is MOVE),
  "speech": "..." (only if action is SPEAK),
  "thought": "..." (your internal monologue, 1-2 sentences)
}`;
}

// Parse the AI response into a decision
export function parseAgentResponse(response: string): AgentDecision | null {
    try {
        // Try to extract JSON from the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;

        const parsed = JSON.parse(jsonMatch[0]);

        // Validate the response
        if (!parsed.action || !parsed.thought) return null;

        const validActions = ["MOVE", "STAY", "SPEAK", "PICKUP"];
        if (!validActions.includes(parsed.action)) return null;

        if (parsed.action === "MOVE") {
            const validDirections = ["UP", "DOWN", "LEFT", "RIGHT"];
            if (!parsed.direction || !validDirections.includes(parsed.direction)) {
                parsed.direction = validDirections[Math.floor(Math.random() * 4)];
            }
        }

        return {
            action: parsed.action,
            direction: parsed.direction,
            speech: parsed.speech,
            thought: parsed.thought,
        };
    } catch {
        return null;
    }
}
