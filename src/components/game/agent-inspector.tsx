"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { X, Brain, Backpack, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Agent {
    _id: Id<"agents">;
    name: string;
    emoji: string;
    personality: string;
    x: number;
    y: number;
    inventory: string[];
    currentThought: string;
    memory: string;
}

interface AgentInspectorProps {
    agent: Agent | undefined;
    worldId: Id<"worlds">;
    onClose: () => void;
}

export function AgentInspector({ agent, worldId, onClose }: AgentInspectorProps) {
    const deleteAgent = useMutation(api.agents.deleteAgent);

    if (!agent) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--muted)] flex items-center justify-center mb-4">
                    <User className="w-8 h-8 text-[var(--muted-foreground)]" />
                </div>
                <h3 className="font-semibold mb-1">No Agent Selected</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                    Click on an agent in the grid to inspect their details
                </p>
            </div>
        );
    }

    const handleDelete = async () => {
        if (confirm(`Remove ${agent.name} from the world?`)) {
            await deleteAgent({ agentId: agent._id });
            onClose();
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{agent.emoji}</span>
                    <div>
                        <h3 className="font-semibold">{agent.name}</h3>
                        <p className="text-xs text-[var(--muted-foreground)]">
                            Position: ({agent.x}, {agent.y})
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-[var(--muted)] rounded-lg transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Personality */}
                <div>
                    <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
                        Personality
                    </h4>
                    <p className="text-sm bg-[var(--muted)] rounded-lg p-3">
                        {agent.personality}
                    </p>
                </div>

                {/* Current Thought */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-purple-400" />
                        <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                            Inner Monologue
                        </h4>
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={agent.currentThought}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-sm bg-gradient-to-br from-purple-500/10 to-blue-500/10 
                         border border-purple-500/20 rounded-lg p-3 italic"
                        >
                            "{agent.currentThought}"
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Inventory */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Backpack className="w-4 h-4 text-amber-400" />
                        <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                            Inventory
                        </h4>
                    </div>
                    {agent.inventory.length === 0 ? (
                        <p className="text-sm text-[var(--muted-foreground)] italic">
                            Empty inventory
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {agent.inventory.map((item, i) => (
                                <div
                                    key={i}
                                    className="w-10 h-10 bg-[var(--muted)] rounded-lg flex items-center justify-center text-xl"
                                >
                                    {item}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Memory */}
                {agent.memory && (
                    <div>
                        <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
                            Memory
                        </h4>
                        <p className="text-sm text-[var(--muted-foreground)] bg-[var(--muted)] rounded-lg p-3">
                            {agent.memory}
                        </p>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-[var(--border)]">
                <button
                    onClick={handleDelete}
                    className="w-full py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                    Remove Agent
                </button>
            </div>
        </div>
    );
}
