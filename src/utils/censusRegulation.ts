import roles from 'roles/all';
import meleeFighter from 'roles/meleeFighter';
import config from '../config.json';

function regulateCensus(room: Room) {
    for (const role of roles.map((r) => r.name).reverse()) {
        switch (role) {
            case 'hauler':
                _.set(room, 'memory.census.hauler', config.census.hauler);
                break;
            case 'upgrader':
                _.set(room, 'memory.census.upgrader', config.census.upgrader);
                break;
            case 'repairer':
                const repairableStructuresNumber = room.find(FIND_STRUCTURES, {
                    filter: (structure) => structure.hits < structure.hitsMax,
                }).length;
                _.set(room, 'memory.census.repairer', repairableStructuresNumber ? config.census.repairer : 0);
                break;
            case 'rampartRepairer':
                const repairableRampartsNumber = room.find(FIND_STRUCTURES, {
                    filter: (structure) =>
                        structure.structureType === STRUCTURE_RAMPART && structure.hits < structure.hitsMax,
                }).length;
                _.set(
                    room,
                    'memory.census.rampartRepairer',
                    repairableRampartsNumber ? config.census.rampartRepairer : 0,
                );
                break;
            case 'builder':
                const sitesNumber = Object.keys(room.find(FIND_MY_CONSTRUCTION_SITES)).length;
                _.set(room, 'memory.census.builder', sitesNumber ? config.census.builder : 0);
                break;
            case 'staticHarvester':
                const containersNum = room.find(FIND_STRUCTURES, {
                    filter: { structureType: STRUCTURE_CONTAINER },
                }).length;
                _.set(room, 'memory.census.staticHarvester', containersNum);
                break;
            case 'meleeFighter':
                const enemiesNum = room.find(FIND_HOSTILE_CREEPS).length;
                _.set(room, 'memory.census.meleeFighter', enemiesNum ? enemiesNum : meleeFighter.min);
            default:
                console.log(`Can't set census for role ${role}`);
                break;
        }
    }
}

export default regulateCensus;
