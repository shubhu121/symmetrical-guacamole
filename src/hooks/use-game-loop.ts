"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseGameLoopProps {
    worldId: string;
    isRunning: boolean;
    speed: number; // ticks per second multiplier
    onTick?: (result: any) => void;
    onError?: (error: Error) => void;
}

export function useGameLoop({
    worldId,
    isRunning,
    speed,
    onTick,
    onError,
}: UseGameLoopProps) {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isProcessingRef = useRef(false);

    const runTick = useCallback(async () => {
        if (isProcessingRef.current) return;

        isProcessingRef.current = true;

        try {
            const response = await fetch("/api/game-tick", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ worldId }),
            });

            if (!response.ok) {
                throw new Error(`Game tick failed: ${response.statusText}`);
            }

            const result = await response.json();
            onTick?.(result);
        } catch (error) {
            onError?.(error as Error);
        } finally {
            isProcessingRef.current = false;
        }
    }, [worldId, onTick, onError]);

    useEffect(() => {
        if (!isRunning) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Base interval is 3 seconds, modified by speed
        // speed 0.5 = 6 seconds, speed 1 = 3 seconds, speed 2 = 1.5 seconds, speed 4 = 0.75 seconds
        // Cap at minimum 1 second to avoid rate limits
        const intervalMs = Math.max(1000, 3000 / speed);

        // Run immediately on start
        runTick();

        intervalRef.current = setInterval(runTick, intervalMs);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isRunning, speed, runTick]);

    return {
        runTick,
        isProcessing: isProcessingRef.current,
    };
}
