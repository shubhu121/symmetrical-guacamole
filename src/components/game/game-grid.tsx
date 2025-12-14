"use client";

import { motion } from "framer-motion";
import { Id } from "../../../../convex/_generated/dataModel";

interface Agent {
    _id: Id<"agents">;
    name: string;
    emoji: string;
    x: number;
    y: number;
    currentThought: string;
}

interface Item {
    _id: Id<"items">;
    name: string;
    emoji: string;
    x: number;
    y: number;
}

interface GameGridProps {
    width: number;
    height: number;
    agents: Agent[];
    items: Item[];
    selectedAgentId: Id<"agents"> | null;
    onSelectAgent: (id: Id<"agents"> | null) => void;
}

export function GameGrid({
    width,
    height,
    agents,
    items,
    selectedAgentId,
    onSelectAgent,
}: GameGridProps) {
    const cellSize = Math.min(40, 600 / Math.max(width, height));

    return (
        <div className="relative">
            {/* Grid Background */}
            <div
                className="grid gap-px bg-[var(--border)] rounded-lg overflow-hidden"
                style={{
                    gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
                    gridTemplateRows: `repeat(${height}, ${cellSize}px)`,
                }}
            >
                {Array.from({ length: width * height }).map((_, i) => {
                    const x = i % width;
                    const y = Math.floor(i / width);

                    // Checkerboard pattern
                    const isDark = (x + y) % 2 === 0;

                    return (
                        <div
                            key={i}
                            className={`${isDark ? "bg-[#1a1a2e]" : "bg-[#16162a]"
                                } transition-colors hover:bg-[var(--muted)]`}
                            style={{ width: cellSize, height: cellSize }}
                        />
                    );
                })}
            </div>

            {/* Items Layer */}
            {items.map((item) => (
                <motion.div
                    key={item._id}
                    className="absolute flex items-center justify-center pointer-events-none"
                    style={{
                        width: cellSize,
                        height: cellSize,
                        left: item.x * (cellSize + 1) + 1,
                        top: item.y * (cellSize + 1) + 1,
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                >
                    <span className="text-xl opacity-80">{item.emoji}</span>
                </motion.div>
            ))}

            {/* Agents Layer */}
            {agents.map((agent) => {
                const isSelected = agent._id === selectedAgentId;

                return (
                    <motion.div
                        key={agent._id}
                        className={`absolute flex items-center justify-center cursor-pointer
              ${isSelected ? "z-20" : "z-10"}`}
                        style={{
                            width: cellSize,
                            height: cellSize,
                        }}
                        initial={false}
                        animate={{
                            left: agent.x * (cellSize + 1) + 1,
                            top: agent.y * (cellSize + 1) + 1,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                        }}
                        onClick={() => onSelectAgent(isSelected ? null : agent._id)}
                        whileHover={{ scale: 1.1 }}
                    >
                        {/* Selection Ring */}
                        {isSelected && (
                            <motion.div
                                className="absolute inset-0 border-2 border-[var(--primary)] rounded-lg"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                layoutId="selection"
                            />
                        )}

                        {/* Agent Emoji */}
                        <motion.span
                            className="text-2xl select-none"
                            animate={{
                                scale: isSelected ? 1.1 : 1,
                            }}
                        >
                            {agent.emoji}
                        </motion.span>

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                          opacity-0 group-hover:opacity-100 pointer-events-none
                          bg-[var(--card)] border border-[var(--border)] rounded px-2 py-1
                          text-xs whitespace-nowrap z-30">
                            <span className="font-medium">{agent.name}</span>
                        </div>
                    </motion.div>
                );
            })}

            {/* Grid Overlay for coordinates */}
            <div className="absolute -left-6 top-0 h-full flex flex-col justify-around text-[10px] text-[var(--muted-foreground)]">
                {Array.from({ length: height }).map((_, i) => (
                    <span key={i}>{i}</span>
                ))}
            </div>
            <div className="absolute -top-5 left-0 w-full flex justify-around text-[10px] text-[var(--muted-foreground)]">
                {Array.from({ length: width }).map((_, i) => (
                    <span key={i}>{i}</span>
                ))}
            </div>
        </div>
    );
}
