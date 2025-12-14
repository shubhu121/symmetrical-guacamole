"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Plus, Play, Pause, Users, Clock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardPage() {
    const worlds = useQuery(api.worlds.listWorlds);
    const createWorld = useMutation(api.worlds.createWorld);
    const [isCreating, setIsCreating] = useState(false);
    const [newWorldName, setNewWorldName] = useState("");

    const handleCreateWorld = async () => {
        if (!newWorldName.trim()) return;

        await createWorld({
            name: newWorldName,
            gridWidth: 15,
            gridHeight: 15,
        });

        setNewWorldName("");
        setIsCreating(false);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">My Simulations</h1>
                    <p className="text-[var(--muted-foreground)] mt-1">
                        Create and manage your AI-powered worlds
                    </p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 
                     text-white font-semibold rounded-lg hover:opacity-90 transition-opacity
                     shadow-lg shadow-blue-500/25"
                >
                    <Plus className="w-5 h-5" />
                    <span>Create Simulation</span>
                </button>
            </div>

            {/* Create Modal */}
            {isCreating && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => setIsCreating(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 w-full max-w-md"
                    >
                        <h2 className="text-xl font-bold mb-4">Create New Simulation</h2>
                        <input
                            type="text"
                            value={newWorldName}
                            onChange={(e) => setNewWorldName(e.target.value)}
                            placeholder="Enter world name..."
                            className="w-full px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            autoFocus
                        />
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setIsCreating(false)}
                                className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateWorld}
                                className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90"
                            >
                                Create
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* World Grid */}
            {worlds === undefined ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="h-64 bg-[var(--card)] rounded-xl border border-[var(--border)] animate-pulse"
                        />
                    ))}
                </div>
            ) : worlds.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-20 h-20 rounded-full bg-[var(--muted)] flex items-center justify-center mb-4">
                        <Plus className="w-10 h-10 text-[var(--muted-foreground)]" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No simulations yet</h3>
                    <p className="text-[var(--muted-foreground)] text-center max-w-md">
                        Create your first AI simulation to get started. Watch as autonomous agents
                        explore, interact, and evolve in your custom world.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {worlds.map((world) => (
                        <WorldCard key={world._id} world={world} />
                    ))}
                </div>
            )}
        </div>
    );
}

function WorldCard({ world }: { world: any }) {
    return (
        <Link href={`/play/${world._id}`}>
            <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden
                   hover:border-[var(--primary)] transition-colors cursor-pointer group"
            >
                {/* Preview Grid */}
                <div className="h-40 bg-gradient-to-br from-[var(--muted)] to-[var(--background)] 
                        relative overflow-hidden">
                    <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-px p-4 opacity-50">
                        {[...Array(64)].map((_, i) => (
                            <div key={i} className="bg-[var(--border)] rounded-sm" />
                        ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-5xl">{world.agents?.length > 0 ? "🌍" : "🌎"}</span>
                    </div>

                    {/* Status Badge */}
                    <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium
            ${world.status === "running"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                    >
                        {world.status === "running" ? (
                            <Play className="w-3 h-3" />
                        ) : (
                            <Pause className="w-3 h-3" />
                        )}
                        {world.status === "running" ? "Running" : "Paused"}
                    </div>
                </div>

                {/* Info */}
                <div className="p-4">
                    <h3 className="font-semibold text-lg group-hover:text-[var(--primary)] transition-colors">
                        {world.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-[var(--muted-foreground)]">
                        <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            <span>{world.agentCount || 0} agents</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>{world.tickCount || 0} ticks</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
