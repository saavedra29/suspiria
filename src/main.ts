import { ErrorMapper } from 'utils/ErrorMapper';
import regulateRoleSpawn from 'utils/roleSpawnRegulation';
import roleHarvester from 'roles/harvester';
import upgrader from 'roles/upgrader';
import builder from 'roles/builder';

declare global {
    /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definition alone.
          You must also give them an implementation if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
    // Memory extension samples
    interface Memory {
        uuid: number;
        log: any;
    }

    interface CreepMemory {
        role: string;
        room?: string;
        working?: boolean;
        state?: string;
        upgrading?: boolean;
        building?: boolean;
    }

    interface RoomMemory {
        census?: {
            harvester: number;
        };
    }

    interface Role {
        body: Array<BodyPartConstant>;
        name: string;
        min: number;
        // (creep: Creep): void;
        run: (c: Creep) => void;
    }
}
// Syntax for adding properties to `global` (ex "global.log")
declare const global: {
    log: any;
};

const roles = [roleHarvester, upgrader, builder];

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
    console.log(`A: Tick ${Game.time} | shard: ${Game.shard.name}`);

    // Automatically delete memory of missing creeps
    for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
            delete Memory.creeps[name];
        }
    }

    _.forEach(Game.rooms, (room) => {
        if (room && room.controller && room.controller.my) {
            if (!('census' in room.memory)) {
                room.memory.census = {
                    harvester: 2,
                };
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
        }
    }
});
