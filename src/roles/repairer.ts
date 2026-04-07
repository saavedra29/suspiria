const repairer = {
    body: [WORK, CARRY, MOVE, MOVE],
    name: 'repairer',
    min: 2,
    run: (creep: Creep) => {
        if (creep.memory.repairing && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.repairing = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory.repairing && creep.store.getFreeCapacity() === 0) {
            creep.memory.repairing = true;
            creep.say('⚡ repair');
        }

        if (creep.memory.repairing) {
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
            const src = creep.pos.findClosestByPath(FIND_SOURCES);
            if (src) {
                if (creep.harvest(src) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(src, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            }
        }
    },
};

export default repairer;
