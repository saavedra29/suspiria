import { BunkerScheme, maintainBunker } from 'bunkers/bunker';
import roles from 'roles/all';
import regulateCensus from 'utils/censusRegulation';
import constructContainers from 'utils/constructContainers';
import { ErrorMapper } from 'utils/ErrorMapper';
import regulateRoleSpawn from 'utils/roleSpawnRegulation';
import roomDefence from 'utils/roomDefence';
import bunker_data from './bunker.json';
import config from './config.json';

const bunker: BunkerScheme = bunker_data;
if (Memory.creepLabels === undefined) {
    Memory.creepLabels = true;
}

function saveRampartsToMem(room: Room) {
    let ramparts: Array<StructureRampart> = room.find(FIND_STRUCTURES, {
        filter: (s) => {
            return s.structureType === STRUCTURE_RAMPART && s.hits < s.hitsMax;
        },
    });
    // const goodRampartsNum = ramparts.filter((r) => r.hits > config.rampart.lowestHitsAllowed).length;
    // const badRampartsNum = ramparts.length - goodRampartsNum;
    // console.log(`Good ramparts: ${goodRampartsNum}\nBad ramparts: ${badRampartsNum}`);
    ramparts.sort((a, b) => {
        return a.hits - b.hits;
    });
    room.memory.rampartIdsAscHitpoints = ramparts.map((rampart) => rampart.id);
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
    // Automatically delete memory of missing creeps
    for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
            delete Memory.creeps[name];
        }
    }

    _.forEach(Game.rooms, (room) => {
        if (room && room.controller && room.controller.my) {
            saveRampartsToMem(room);

            const containersNum = room.find(FIND_STRUCTURES, { filter: STRUCTURE_CONTAINER }).length;
            const sourcesNum = room.find(FIND_SOURCES).length;
            if (containersNum < sourcesNum && room.controller.level >= config.containerConstructionFromLevel) {
                constructContainers(room);
            }

            maintainBunker(room, bunker);
            if (room.find(FIND_HOSTILE_CREEPS).length) {
                _.set(room.memory, 'underAttack', true);
            } else {
                _.set(room.memory, 'underAttack', false);
            }
            roomDefence(room);
            if (!room.memory.manualCensus) {
                regulateCensus(room);
            }
            for (let role of roles) {
                regulateRoleSpawn(room, role);
            }
        }
    });

    for (const name in Game.creeps) {
        const creep = Game.creeps[name];
        const roleModule = roles.find((role) => role.name === creep.memory.role);
        if (roleModule) {
            roleModule.run(creep);
            if (Memory.creepLabels === true) {
                creep.room.visual.text(creep.memory.role, creep.pos.x + 0.5, creep.pos.y - 0.5, {
                    color: roleModule?.color,
                    opacity: config.visuals.creep_label.opacity,
                    font: config.visuals.creep_label.font_size,
                });
            }
        }
    }
});
