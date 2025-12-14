"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
    Play,
    Pause,
    Zap,
    Apple,
    TreeDeciduous,
    Gem,
    UserPlus,
    Send,
    Trash2
} from "lucide-react";

interface GodControlsProps {
    worldId: Id<"worlds">;
    world: {
        status: "running" | "paused";
        speed: number;
        tickCount: number;
    };
}

const ITEMS = [
    { name: "Apple", emoji: "🍎", icon: Apple },
    { name: "Wood", emoji: "🪵", icon: TreeDeciduous },
    { name: "Gem", emoji: "💎", icon: Gem },
    { name: "Coin", emoji: "🪙", icon: Gem },
];

const SPEED_OPTIONS = [
    { label: "0.5x", value: 0.5 },
    { label: "1x", value: 1 },
    { label: "2x", value: 2 },
    { label: "4x", value: 4 },
];

export function GodControls({ worldId, world }: GodControlsProps) {
    const togglePause = useMutation(api.worlds.togglePause);
    const updateWorld = useMutation(api.worlds.updateWorld);
    const spawnItem = useMutation(api.items.spawnItem);
    const createAgent = useMutation(api.agents.createAgent);
    const addLog = useMutation(api.logs.addLog);

    const [agentName, setAgentName] = useState("");
    const [globalEvent, setGlobalEvent] = useState("");
    const [selectedItem, setSelectedItem] = useState<typeof ITEMS[0] | null>(null);

    const handleTogglePause = async () => {
        await togglePause({ worldId });
    };

    const handleSpeedChange = async (speed: number) => {
        await updateWorld({ worldId, speed });
    };

    const handleSpawnItem = async () => {
        if (!selectedItem) return;

        // Random position
        const x = Math.floor(Math.random() * 15);
        const y = Math.floor(Math.random() * 15);

        await spawnItem({
            worldId,
            name: selectedItem.name,
            emoji: selectedItem.emoji,
            x,
            y,
        });

        setSelectedItem(null);
    };

    const handleAddAgent = async () => {
        if (!agentName.trim()) return;

        await createAgent({
            worldId,
            name: agentName,
        });

        setAgentName("");
    };

    const handleGlobalEvent = async () => {
        if (!globalEvent.trim()) return;

        await addLog({
            worldId,
            message: `🌍 ${globalEvent}`,
            type: "event",
        });

        setGlobalEvent("");
    };

    return (
        <div className="p-4 space-y-6">
            {/* World Controls */}
            <div>
                <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">
                    World Controls
                </h3>

                {/* Play/Pause */}
                <button
                    onClick={handleTogglePause}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all
            ${world.status === "running"
                            ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                            : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        }`}
                >
                    {world.status === "running" ? (
                        <>
                            <Pause className="w-5 h-5" />
                            <span>Pause</span>
                        </>
                    ) : (
                        <>
                            <Play className="w-5 h-5" />
                            <span>Start</span>
                        </>
                    )}
                </button>

                {/* Speed Control */}
                <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-[var(--muted-foreground)]" />
                        <span className="text-sm text-[var(--muted-foreground)]">Speed</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                        {SPEED_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSpeedChange(option.value)}
                                className={`py-2 rounded text-sm font-medium transition-colors
                  ${world.speed === option.value
                                        ? "bg-[var(--primary)] text-white"
                                        : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]"
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add Agent */}
            <div>
                <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">
                    Add Agent
                </h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        placeholder="Agent name..."
                        className="flex-1 px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        onKeyDown={(e) => e.key === "Enter" && handleAddAgent()}
                    />
                    <button
                        onClick={handleAddAgent}
                        disabled={!agentName.trim()}
                        className="p-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 
                       disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <UserPlus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Spawn Items */}
            <div>
                <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">
                    Spawn Items
                </h3>
                <div className="grid grid-cols-4 gap-2 mb-2">
                    {ITEMS.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setSelectedItem(selectedItem?.name === item.name ? null : item)}
                            className={`aspect-square flex items-center justify-center text-2xl rounded-lg transition-all
                ${selectedItem?.name === item.name
                                    ? "bg-[var(--primary)] ring-2 ring-[var(--primary)]"
                                    : "bg-[var(--muted)] hover:bg-[var(--border)]"
                                }`}
                            title={item.name}
                        >
                            {item.emoji}
                        </button>
                    ))}
                </div>
                {selectedItem && (
                    <button
                        onClick={handleSpawnItem}
                        className="w-full py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 text-sm"
                    >
                        Spawn {selectedItem.name} at random position
                    </button>
                )}
            </div>

            {/* Global Event */}
            <div>
                <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">
                    Global Event
                </h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={globalEvent}
                        onChange={(e) => setGlobalEvent(e.target.value)}
                        placeholder="It started raining..."
                        className="flex-1 px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        onKeyDown={(e) => e.key === "Enter" && handleGlobalEvent()}
                    />
                    <button
                        onClick={handleGlobalEvent}
                        disabled={!globalEvent.trim()}
                        className="p-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90
                       disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
