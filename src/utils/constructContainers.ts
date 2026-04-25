function constructContainers(room: Room) {
    // Construct one container for each energy source in the room
    const sources = room.find(FIND_SOURCES);
    if (!sources.length) return;
    for (const source of sources) {
        const walkableAround = getWalkableTilesAround(source);
        const sortedWalkableAround = walkableAround.sort((a, b) => {
            return countWalkableAround(b) - countWalkableAround(a);
        });
        room.createConstructionSite(sortedWalkableAround[0].x, sortedWalkableAround[0].y, STRUCTURE_CONTAINER);
    }
}

function getWalkableTilesAround(source: Source): RoomPosition[] {
    const terrain = source.room.getTerrain();
    const positions: RoomPosition[] = [];

    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            const x = source.pos.x + dx;
            const y = source.pos.y + dy;
            if (terrain.get(x, y) === TERRAIN_MASK_WALL) continue;
            const pos = new RoomPosition(x, y, source.room.name);

            const structures = pos.lookFor(LOOK_STRUCTURES);
            const hasBlocking = structures.some(
                (s) =>
                    s.structureType !== STRUCTURE_CONTAINER &&
                    s.structureType !== STRUCTURE_ROAD &&
                    s.structureType !== STRUCTURE_RAMPART,
            );
            if (hasBlocking) continue;
            positions.push(pos);
        }
    }

    return positions;
}

function countWalkableAround(pos: RoomPosition): number {
    const terrain = Game.rooms[pos.roomName].getTerrain();
    let count = 0;

    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;

            const x = pos.x + dx;
            const y = pos.y + dy;

            if (terrain.get(x, y) === TERRAIN_MASK_WALL) continue;
            const checkPos = new RoomPosition(x, y, pos.roomName);

            const structures = checkPos.lookFor(LOOK_STRUCTURES);
            const hasBlocking = structures.some(
                (s) =>
                    s.structureType !== STRUCTURE_CONTAINER &&
                    s.structureType !== STRUCTURE_ROAD &&
                    s.structureType !== STRUCTURE_RAMPART,
            );

            if (!hasBlocking) count++;
        }
    }
    return count;
}

export default constructContainers;
