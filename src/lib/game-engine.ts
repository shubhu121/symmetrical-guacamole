// Game engine utilities

interface Position {
    x: number;
    y: number;
}

// Calculate Manhattan distance between two positions
export function calculateDistance(a: Position, b: Position): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// Get nearby entities within a radius
export function getNearbyEntities<T extends Position>(
    entity: Position,
    allEntities: T[],
    radius: number
): T[] {
    return allEntities.filter((other) => {
        if (other === entity) return false;
        return calculateDistance(entity, other) <= radius;
    });
}

// Check if a move is valid within grid bounds
export function isValidMove(
    x: number,
    y: number,
    gridWidth: number,
    gridHeight: number
): boolean {
    return x >= 0 && x < gridWidth && y >= 0 && y < gridHeight;
}

// Get new position after a move
export function getNewPosition(
    current: Position,
    direction: "UP" | "DOWN" | "LEFT" | "RIGHT",
    gridWidth: number,
    gridHeight: number
): Position {
    let newX = current.x;
    let newY = current.y;

    switch (direction) {
        case "UP":
            newY = Math.max(0, current.y - 1);
            break;
        case "DOWN":
            newY = Math.min(gridHeight - 1, current.y + 1);
            break;
        case "LEFT":
            newX = Math.max(0, current.x - 1);
            break;
        case "RIGHT":
            newX = Math.min(gridWidth - 1, current.x + 1);
            break;
    }

    return { x: newX, y: newY };
}

// Check if two positions are the same
export function samePosition(a: Position, b: Position): boolean {
    return a.x === b.x && a.y === b.y;
}

// Get random direction
export function getRandomDirection(): "UP" | "DOWN" | "LEFT" | "RIGHT" {
    const directions: ("UP" | "DOWN" | "LEFT" | "RIGHT")[] = ["UP", "DOWN", "LEFT", "RIGHT"];
    return directions[Math.floor(Math.random() * directions.length)];
}

// Get direction towards a target
export function getDirectionTowards(
    from: Position,
    to: Position
): "UP" | "DOWN" | "LEFT" | "RIGHT" | "STAY" {
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    if (dx === 0 && dy === 0) return "STAY";

    // Prioritize larger difference
    if (Math.abs(dx) >= Math.abs(dy)) {
        return dx > 0 ? "RIGHT" : "LEFT";
    } else {
        return dy > 0 ? "DOWN" : "UP";
    }
}
