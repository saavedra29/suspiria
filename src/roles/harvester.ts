var roleHarvester = {
    body: [WORK, CARRY, MOVE, MOVE],
    name: 'harvester',
    min: 2,

    /** @param {Creep} creep **/
    run: function (creep: Creep) {
        // If the creep is carrying no energy, set its state to GET_ENERGY.
        // Else if the creep is fully loaded, set its state to 'TRANSFER'.
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.state = 'GET_ENERGY';
        } else if (creep.store.getFreeCapacity() === 0) {
            creep.memory.state = 'TRANSFER';
        }
        // If the creep's state is GET_ENERGY make it harvest energy
        if (creep.memory.state === 'GET_ENERGY') {
            const sources = creep.room.find(FIND_SOURCES, {
                filter: (object) => {
                    return object.energy > 0;
                },
            });
            const src = creep.pos.findClosestByPath(sources) as Source;
            if (creep.harvest(src) === ERR_NOT_IN_RANGE) {
                creep.moveTo(src, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        } else if (creep.memory.state === 'TRANSFER') {
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

// module.exports = roleHarvester;
export default roleHarvester;
