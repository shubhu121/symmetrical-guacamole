"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Id } from "../../../../convex/_generated/dataModel";

interface Log {
    _id: Id<"logs">;
    message: string;
    type: "action" | "speech" | "thought" | "system" | "event";
    timestamp: number;
}

interface LogFeedProps {
    logs: Log[];
}

const TYPE_STYLES = {
    action: "text-blue-400",
    speech: "text-green-400",
    thought: "text-purple-400",
    system: "text-yellow-400",
    event: "text-orange-400",
};

const TYPE_ICONS = {
    action: "🏃",
    speech: "💬",
    thought: "💭",
    system: "⚙️",
    event: "🌍",
};

export function LogFeed({ logs }: LogFeedProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new logs
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs.length]);

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-3 border-b border-[var(--border)] flex items-center justify-between">
                <h3 className="text-sm font-semibold">Activity Log</h3>
                <span className="text-xs text-[var(--muted-foreground)]">
                    {logs.length} events
                </span>
            </div>

            {/* Log List */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-3 space-y-1"
            >
                <AnimatePresence initial={false}>
                    {logs.map((log) => (
                        <motion.div
                            key={log._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex gap-2 text-xs py-1"
                        >
                            <span className="text-[var(--muted-foreground)] font-mono shrink-0">
                                [{formatTime(log.timestamp)}]
                            </span>
                            <span className="shrink-0">{TYPE_ICONS[log.type]}</span>
                            <span className={TYPE_STYLES[log.type]}>
                                {log.message}
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {logs.length === 0 && (
                    <div className="text-center text-[var(--muted-foreground)] text-sm py-8">
                        No activity yet
                    </div>
                )}
            </div>
        </div>
    );
}
