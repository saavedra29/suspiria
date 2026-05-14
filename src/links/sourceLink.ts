export function runSourceLinks(room: Room) {
    if (!room.memory.storageLinkId) return;
    const storageLink = Game.getObjectById(room.memory.storageLinkId);
    if (!storageLink) return;
    const links: StructureLink[] = room.find(FIND_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_LINK });
    for (const link of links) {
        if (link === storageLink) continue;
        if (
            link.store.getFreeCapacity(RESOURCE_ENERGY) === 0 &&
            storageLink.store.getUsedCapacity(RESOURCE_ENERGY) === 0
        ) {
            const res = link.transferEnergy(storageLink);
            if (res !== OK) {
                console.log('Problem transfering energy: ' + res);
            }
        }
    }
}
