import { close } from 'fs';
import { State } from 'types';

const repairer = {
    body: [WORK, CARRY, MOVE, MOVE],
    name: 'repairer',
    min: 2,
    initState: State.Harvest,
    color: '#fbfbb6',
    run: (creep: Creep) => {
        if (creep.memory.state === State.Repair && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.state = State.Harvest;
            creep.say('🔄 harvest');
        }
        if (creep.memory.state === State.Harvest && creep.store.getFreeCapacity() === 0) {
            creep.memory.state = State.Repair;
            creep.say('⚡ repair');
        }

        if (creep.memory.state === State.Repair) {
            const damagedTargets = creep.room.find(FIND_STRUCTURES, {
                filter: (object) => object.hits < object.hitsMax,
            });
            // TODO Prefer containers before anything else
            damagedTargets.sort((a, b) => a.hits - b.hits);
            if (damagedTargets.length) {
                if (creep.repair(damagedTargets[0]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(damagedTargets[0]);
                }
            }
        } else {
            const nonEmptyContainers: Array<StructureContainer> = creep.room.find(FIND_STRUCTURES, {
                filter: (s) =>
                    s.structureType === STRUCTURE_CONTAINER &&
                    (s as StructureContainer).store.getUsedCapacity(RESOURCE_ENERGY),
            });
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

export default repairer;
