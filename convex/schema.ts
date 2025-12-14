import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    worlds: defineTable({
        ownerId: v.string(),
        name: v.string(),
        status: v.union(v.literal("running"), v.literal("paused")),
        tickCount: v.number(),
        gridWidth: v.number(),
        gridHeight: v.number(),
        speed: v.number(), // ticks per second multiplier
        createdAt: v.number(),
    })
        .index("by_owner", ["ownerId"])
        .index("by_status", ["status"]),

    agents: defineTable({
        worldId: v.id("worlds"),
        name: v.string(),
        personality: v.string(),
        x: v.number(),
        y: v.number(),
        emoji: v.string(),
        inventory: v.array(v.string()),
        currentThought: v.string(),
        memory: v.string(),
        createdAt: v.number(),
    })
        .index("by_world", ["worldId"]),

    logs: defineTable({
        worldId: v.id("worlds"),
        agentId: v.optional(v.id("agents")),
        message: v.string(),
        type: v.union(
            v.literal("action"),
            v.literal("speech"),
            v.literal("thought"),
            v.literal("system"),
            v.literal("event")
        ),
        timestamp: v.number(),
    })
        .index("by_world", ["worldId"])
        .index("by_world_timestamp", ["worldId", "timestamp"]),

    items: defineTable({
        worldId: v.id("worlds"),
        name: v.string(),
        emoji: v.string(),
        x: v.number(),
        y: v.number(),
    })
        .index("by_world", ["worldId"]),
});
