import { getWalkableTilesAround } from './utils';

function constructContainers(room: Room) {
    // Construct one container for each energy source in the room
    const sources = room.find(FIND_SOURCES);
    if (!sources.length) return;
    for (const source of sources) {
        const walkableAround = getWalkableTilesAround(source.pos, room);
        const sortedWalkableAround = walkableAround.sort((a, b) => {
            return getWalkableTilesAround(b, room).length - getWalkableTilesAround(a, room).length;
        });
        room.createConstructionSite(sortedWalkableAround[0].x, sortedWalkableAround[0].y, STRUCTURE_CONTAINER);
    }
}

export default constructContainers;
