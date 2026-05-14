import { getWalkableTilesAround } from './utils';

function constructContainers(room: Room) {
    // Construct one container for each energy source in the room
    const sources = room.find(FIND_SOURCES);
    if (!sources.length) return;
    for (const source of sources) {
        const walkableAround = getWalkableTilesAround(source.pos, room);

        // Skip if a container already exists near the source
        const alreadyHasContainer = walkableAround.some((pos) =>
            pos.lookFor(LOOK_STRUCTURES).some((s) => s.structureType === STRUCTURE_CONTAINER),
        );
        if (alreadyHasContainer) continue;

        // Skip if a construction site already exists near the source
        const alreadyHasSite = walkableAround.some((pos) =>
            pos.lookFor(LOOK_CONSTRUCTION_SITES).some((s) => s.structureType === STRUCTURE_CONTAINER),
        );
        if (alreadyHasSite) continue;

        const sortedWalkableAround = walkableAround.sort((a, b) => {
            return getWalkableTilesAround(b, room).length - getWalkableTilesAround(a, room).length;
        });
        room.createConstructionSite(sortedWalkableAround[0].x, sortedWalkableAround[0].y, STRUCTURE_CONTAINER);
    }
}

export default constructContainers;
