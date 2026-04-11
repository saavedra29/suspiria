import { ErrorMapper } from 'utils/ErrorMapper';
import regulateRoleSpawn from 'utils/roleSpawnRegulation';
import regulateCensus from 'utils/censusRegulation';
import harvester from 'roles/harvester';
import upgrader from 'roles/upgrader';
import builder from 'roles/builder';
import repairer from 'roles/repairer';
import staticHarvester from 'roles/staticHarvester';

export const roles = [harvester, upgrader, builder, staticHarvester, repairer].reverse();

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
        }
    }
});
