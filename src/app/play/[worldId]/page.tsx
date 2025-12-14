"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { GameGrid } from "@/components/game/game-grid";
import { GodControls } from "@/components/game/god-controls";
import { AgentInspector } from "@/components/game/agent-inspector";
import { LogFeed } from "@/components/game/log-feed";
import { useGameLoop } from "@/hooks/use-game-loop";
import { ArrowLeft, Users, Zap } from "lucide-react";
import Link from "next/link";

export default function PlayPage({ params }: { params: Promise<{ worldId: string }> }) {
    const { worldId } = use(params);
    const world = useQuery(api.worlds.getWorld, { worldId: worldId as Id<"worlds"> });
    const agents = useQuery(api.agents.getAgentsByWorld, { worldId: worldId as Id<"worlds"> });
    const items = useQuery(api.items.getItemsByWorld, { worldId: worldId as Id<"worlds"> });
    const logs = useQuery(api.logs.getLogsByWorld, { worldId: worldId as Id<"worlds">, limit: 100 });

    const [selectedAgentId, setSelectedAgentId] = useState<Id<"agents"> | null>(null);

    const selectedAgent = agents?.find((a) => a._id === selectedAgentId);

    // Game loop for AI simulation
    useGameLoop({
        worldId,
        isRunning: world?.status === "running",
        speed: world?.speed || 1,
    });

    if (!world) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-pulse text-[var(--muted-foreground)]">Loading world...</div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col -m-6">
            {/* Top Bar */}
            <div className="h-14 bg-[var(--card)] border-b border-[var(--border)] flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-semibold">{world.name}</h1>
                        <p className="text-xs text-[var(--muted-foreground)]">
                            Tick #{world.tickCount} • {world.gridWidth}x{world.gridHeight} grid
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <Users className="w-4 h-4" />
                    <span>{agents?.length || 0} agents</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel - God Controls */}
                <div className="w-72 bg-[var(--card)] border-r border-[var(--border)] overflow-y-auto">
                    <GodControls
                        worldId={worldId as Id<"worlds">}
                        world={world}
                    />
                </div>

                {/* Center Panel - Game Grid */}
                <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
                    <GameGrid
                        width={world.gridWidth}
                        height={world.gridHeight}
                        agents={agents || []}
                        items={items || []}
                        selectedAgentId={selectedAgentId}
                        onSelectAgent={setSelectedAgentId}
                    />
                </div>

                {/* Right Panel - Inspector & Logs */}
                <div className="w-80 bg-[var(--card)] border-l border-[var(--border)] flex flex-col">
                    {/* Agent Inspector */}
                    <div className="flex-1 overflow-y-auto border-b border-[var(--border)]">
                        <AgentInspector
                            agent={selectedAgent}
                            worldId={worldId as Id<"worlds">}
                            onClose={() => setSelectedAgentId(null)}
                        />
                    </div>

                    {/* Log Feed */}
                    <div className="h-72 overflow-hidden">
                        <LogFeed logs={logs || []} />
                    </div>
                </div>
            </div>
        </div>
    );
}
