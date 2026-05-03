function getFreeContainerId(room: Room): Id<StructureContainer> | null {
    const containers: StructureContainer[] = room.find(FIND_STRUCTURES, {
        filter: { structureType: STRUCTURE_CONTAINER },
    });
    const assignedIds = Object.values(Game.creeps)
        .filter((c) => c.memory.role === 'staticHarvester' && c.memory.assignedContainer)
        .map((c) => c.memory.assignedContainer);
    const freeContainer = containers.find((c) => !assignedIds.includes(c.id));
    return freeContainer ? freeContainer.id : null;
}

function loadEnergy(creep: Creep) {
    // Harvest logic – exactly the same as your repairer (containers first, then sources)
    const nonEmptyContainers: Array<StructureContainer> = creep.room.find(FIND_STRUCTURES, {
        filter: (s) =>
            s.structureType === STRUCTURE_CONTAINER &&
            (s as StructureContainer).store.getUsedCapacity(RESOURCE_ENERGY) > 0,
    });

    if (nonEmptyContainers.length) {
        const closest = creep.pos.findClosestByPath(nonEmptyContainers);
        if (closest && creep.withdraw(closest, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(closest, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
    } else {
        const nonEmptySources = creep.room.find(FIND_SOURCES, {
            filter: (s) => s.energy > 0,
        });
        const closestSource = creep.pos.findClosestByPath(nonEmptySources);
        if (closestSource && creep.harvest(closestSource) === ERR_NOT_IN_RANGE) {
            creep.moveTo(closestSource, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
    }
}

function getWalkableTilesAround(roomPosition: RoomPosition, room: Room): RoomPosition[] {
    const terrain = room.getTerrain();
    const positions: RoomPosition[] = [];

    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            const x = roomPosition.x + dx;
            const y = roomPosition.y + dy;
            if (terrain.get(x, y) === TERRAIN_MASK_WALL) continue;
            const pos = new RoomPosition(x, y, room.name);

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

export { getFreeContainerId, loadEnergy, getWalkableTilesAround };
