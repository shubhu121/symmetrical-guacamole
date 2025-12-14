import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createWorld = mutation({
    args: {
        name: v.string(),
        gridWidth: v.optional(v.number()),
        gridHeight: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const worldId = await ctx.db.insert("worlds", {
            ownerId: identity.subject,
            name: args.name,
            status: "paused",
            tickCount: 0,
            gridWidth: args.gridWidth ?? 15,
            gridHeight: args.gridHeight ?? 15,
            speed: 1,
            createdAt: Date.now(),
        });

        return worldId;
    },
});

export const listWorlds = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        const worlds = await ctx.db
            .query("worlds")
            .withIndex("by_owner", (q) => q.eq("ownerId", identity.subject))
            .order("desc")
            .collect();

        // Get agent counts for each world
        const worldsWithCounts = await Promise.all(
            worlds.map(async (world) => {
                const agents = await ctx.db
                    .query("agents")
                    .withIndex("by_world", (q) => q.eq("worldId", world._id))
                    .collect();
                return {
                    ...world,
                    agentCount: agents.length,
                };
            })
        );

        return worldsWithCounts;
    },
});

export const getWorld = query({
    args: { worldId: v.id("worlds") },
    handler: async (ctx, args) => {
        const world = await ctx.db.get(args.worldId);
        return world;
    },
});

export const updateWorld = mutation({
    args: {
        worldId: v.id("worlds"),
        name: v.optional(v.string()),
        status: v.optional(v.union(v.literal("running"), v.literal("paused"))),
        speed: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { worldId, ...updates } = args;

        const world = await ctx.db.get(worldId);
        if (!world) {
            throw new Error("World not found");
        }

        await ctx.db.patch(worldId, updates);
    },
});

export const togglePause = mutation({
    args: { worldId: v.id("worlds") },
    handler: async (ctx, args) => {
        const world = await ctx.db.get(args.worldId);
        if (!world) {
            throw new Error("World not found");
        }

        const newStatus = world.status === "running" ? "paused" : "running";
        await ctx.db.patch(args.worldId, { status: newStatus });

        return newStatus;
    },
});

export const incrementTick = mutation({
    args: { worldId: v.id("worlds") },
    handler: async (ctx, args) => {
        const world = await ctx.db.get(args.worldId);
        if (!world) {
            throw new Error("World not found");
        }

        await ctx.db.patch(args.worldId, {
            tickCount: world.tickCount + 1
        });

        return world.tickCount + 1;
    },
});

export const deleteWorld = mutation({
    args: { worldId: v.id("worlds") },
    handler: async (ctx, args) => {
        // Delete all agents
        const agents = await ctx.db
            .query("agents")
            .withIndex("by_world", (q) => q.eq("worldId", args.worldId))
            .collect();

        for (const agent of agents) {
            await ctx.db.delete(agent._id);
        }

        // Delete all logs
        const logs = await ctx.db
            .query("logs")
            .withIndex("by_world", (q) => q.eq("worldId", args.worldId))
            .collect();

        for (const log of logs) {
            await ctx.db.delete(log._id);
        }

        // Delete all items
        const items = await ctx.db
            .query("items")
            .withIndex("by_world", (q) => q.eq("worldId", args.worldId))
            .collect();

        for (const item of items) {
            await ctx.db.delete(item._id);
        }

        // Delete the world
        await ctx.db.delete(args.worldId);
    },
});
