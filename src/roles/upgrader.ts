import { State } from 'types';

const upgrader = {
    body: [WORK, WORK, CARRY, MOVE],
    name: 'upgrader',
    min: 2,
    initState: State.Harvest,
    run: (creep: Creep) => {
        if (creep.memory.state === State.Upgrade && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.state = State.Harvest;
            creep.say('🔄 harvest');
        }
        if (creep.memory.state === State.Harvest && creep.store.getFreeCapacity() === 0) {
            creep.memory.state = State.Upgrade;
            creep.say('⚡ upgrade');
        }

        const noneEmptySources = creep.room.find(FIND_SOURCES, {
            filter: (object) => {
                return object.energy > 0;
            },
        });
        const closestSource = creep.pos.findClosestByPath(noneEmptySources);

        if (creep.memory.state === State.Upgrade) {
            if (!creep.room.controller) return;
            if (closestSource) {
                const distanceFromSource = creep.pos.getRangeTo(closestSource);
                if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE || distanceFromSource <= 1) {
                    creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            } else {
                if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
        } else {
            if (closestSource) {
                if (creep.harvest(closestSource) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestSource, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            }
        }
    },
};

export default upgrader;
