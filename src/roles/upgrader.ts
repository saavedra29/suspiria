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

        // const noneEmptySources = creep.room.find(FIND_SOURCES, {
        //     filter: (object) => {
        //         return object.energy > 0;
        //     },
        // });

        const nonEmptyContainers: Array<StructureContainer> = creep.room.find(FIND_STRUCTURES, {
            filter: (s) =>
                s.structureType === STRUCTURE_CONTAINER &&
                (s as StructureContainer).store.getUsedCapacity(RESOURCE_ENERGY),
        });

        if (creep.memory.state === State.Upgrade) {
            if (!creep.room.controller) return;
            if (nonEmptyContainers.length) {
                const distanceFromSource = creep.pos.getRangeTo(nonEmptyContainers[0]);
                // TODO Here the upgrader take care not to stay close to the energy storage when idle
                // in order not to bother (enhance)
                if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE || distanceFromSource <= 1) {
                    creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            } else {
                if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
        } else {
            if (nonEmptyContainers.length) {
                const closestNonEmptyContainer = creep.pos.findClosestByPath(nonEmptyContainers);
                if (closestNonEmptyContainer) {
                    if (creep.withdraw(closestNonEmptyContainer, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(closestNonEmptyContainer, { visualizePathStyle: { stroke: '#ffaa00' } });
                    }
                }
            }
        }
    },
};

export default upgrader;
