import { ErrorMapper } from 'utils/ErrorMapper';
import regulateRoleSpawn from 'utils/roleSpawnRegulation';
import regulateCensus from 'utils/censusRegulation';
import roles from 'roles/all';
import roomDefence from 'utils/roomDefence';

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
            if (room.find(FIND_HOSTILE_CREEPS).length) {
                _.set(room.memory, 'underAttack', true);
            } else {
                _.set(room.memory, 'underAttack', false);
            }
            roomDefence(room);
            regulateCensus(room);
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
            if (Memory.creepLabels) {
                creep.room.visual.text(creep.memory.role, creep.pos.x + 0.5, creep.pos.y - 0.5, {
                    color: roleModule?.color,
                    opacity: 0.7,
                    font: 0.4,
                });
            }
        }
    }
});
