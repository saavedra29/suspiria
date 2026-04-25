import { State } from 'types';
import { loadEnergy } from 'utils/utils';

const upgrader = {
    body: [WORK, CARRY, MOVE, MOVE],
    name: 'upgrader',
    min: 2,
    initState: State.Harvest,
    color: '#b1deff',
    run: (creep: Creep) => {
        if (creep.memory.state === State.Upgrade && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.state = State.Harvest;
            creep.say('🔄 harvest');
        }
        if (creep.memory.state === State.Harvest && creep.store.getFreeCapacity() === 0) {
            creep.memory.state = State.Upgrade;
            creep.say('⚡ upgrade');
        }

        if (creep.memory.state === State.Upgrade) {
            if (!creep.room.controller) return;
            if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
            }
        } else loadEnergy(creep);
    },
};

export default upgrader;
