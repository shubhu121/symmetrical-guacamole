import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addLog = mutation({
    args: {
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
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("logs", {
            worldId: args.worldId,
            agentId: args.agentId,
            message: args.message,
            type: args.type,
            timestamp: Date.now(),
        });
    },
});

export const getLogsByWorld = query({
    args: {
        worldId: v.id("worlds"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const logs = await ctx.db
            .query("logs")
            .withIndex("by_world_timestamp", (q) => q.eq("worldId", args.worldId))
            .order("desc")
            .take(args.limit ?? 50);

        return logs.reverse(); // Return in chronological order
    },
});

export const clearLogs = mutation({
    args: { worldId: v.id("worlds") },
    handler: async (ctx, args) => {
        const logs = await ctx.db
            .query("logs")
            .withIndex("by_world", (q) => q.eq("worldId", args.worldId))
            .collect();

        for (const log of logs) {
            await ctx.db.delete(log._id);
        }
    },
});
