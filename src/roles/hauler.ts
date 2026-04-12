import { State } from 'types';

const hauler = {
    body: [WORK, CARRY, MOVE, MOVE],
    name: 'hauler',
    min: 2,
    color: '#93ff6b',
    initState: State.Harvest,

    /** @param {Creep} creep **/
    run: (creep: Creep) => {
        // If the creep is carrying no energy, set its state to GET_ENERGY.
        // Else if the creep is fully loaded, set its state to 'TRANSFER'.
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.state = State.Harvest;
        } else if (creep.store.getFreeCapacity() === 0) {
            creep.memory.state = State.Load;
        }
        if (creep.memory.state === State.Harvest) {
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
            } else {
                const nonEmptySources = creep.room.find(FIND_SOURCES, {
                    filter: function (object) {
                        return object.energy > 0;
                    },
                });
                let closestNonEmptySource = creep.pos.findClosestByPath(nonEmptySources);
                if (closestNonEmptySource) {
                    if (creep.harvest(closestNonEmptySource) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(closestNonEmptySource, { visualizePathStyle: { stroke: '#ffaa00' } });
                    }
                }
            }
        } else if (creep.memory.state === State.Load) {
            const targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (
                        (structure.structureType === STRUCTURE_SPAWN ||
                            structure.structureType === STRUCTURE_EXTENSION) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                    );
                },
            });
            if (targets.length > 0) {
                if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    // TODO Take care if another error is returned apart from ERR_NOT_IN_RANGE
                    creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
        }
    },
};

export default hauler;
