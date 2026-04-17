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

export { getFreeContainerId };
