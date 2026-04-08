import { roles } from 'main';

function regulateCensus(room: Room) {
    for (const role of roles.map((r) => r.name).reverse()) {
        switch (role) {
            case 'harvester':
                _.set(room, 'memory.census.harvester', 2);
                break;
            case 'upgrader':
                _.set(room, 'memory.census.upgrader', 2);
                break;
            case 'repairer':
                const repairableStructuresNumber = room.find(FIND_STRUCTURES, {
                    filter: (structure) => structure.hits < structure.hitsMax,
                }).length;
                _.set(room, 'memory.census.repairer', repairableStructuresNumber ? 2 : 0);
                break;
            case 'builder':
                const sitesNumber = Object.keys(room.find(FIND_MY_CONSTRUCTION_SITES)).length;
                _.set(room, 'memory.census.builder', sitesNumber ? 2 : 0);
                break;
            default:
                console.log('Found default');
                break;
        }
    }
}

export default regulateCensus;
