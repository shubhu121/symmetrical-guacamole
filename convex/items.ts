import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const spawnItem = mutation({
    args: {
        worldId: v.id("worlds"),
        name: v.string(),
        emoji: v.string(),
        x: v.number(),
        y: v.number(),
    },
    handler: async (ctx, args) => {
        const itemId = await ctx.db.insert("items", {
            worldId: args.worldId,
            name: args.name,
            emoji: args.emoji,
            x: args.x,
            y: args.y,
        });

        await ctx.db.insert("logs", {
            worldId: args.worldId,
            message: `A ${args.name} appeared at (${args.x}, ${args.y})`,
            type: "event",
            timestamp: Date.now(),
        });

        return itemId;
    },
});

export const getItemsByWorld = query({
    args: { worldId: v.id("worlds") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("items")
            .withIndex("by_world", (q) => q.eq("worldId", args.worldId))
            .collect();
    },
});

export const removeItem = mutation({
    args: { itemId: v.id("items") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.itemId);
    },
});

export const pickupItem = mutation({
    args: {
        agentId: v.id("agents"),
        itemId: v.id("items"),
    },
    handler: async (ctx, args) => {
        const agent = await ctx.db.get(args.agentId);
        const item = await ctx.db.get(args.itemId);

        if (!agent || !item) {
            throw new Error("Agent or item not found");
        }

        // Add item to inventory
        await ctx.db.patch(args.agentId, {
            inventory: [...agent.inventory, item.emoji],
        });

        // Remove item from world
        await ctx.db.delete(args.itemId);

        // Log the action
        await ctx.db.insert("logs", {
            worldId: agent.worldId,
            agentId: args.agentId,
            message: `${agent.name} picked up ${item.name}`,
            type: "action",
            timestamp: Date.now(),
        });
    },
});
