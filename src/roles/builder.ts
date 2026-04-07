const builder = {
    body: [WORK, CARRY, MOVE, MOVE],
    name: 'builder',
    min: 2,
    run: (creep: Creep) => {
        if (creep.memory.building && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory.building && creep.store.getFreeCapacity() === 0) {
            creep.memory.building = true;
            creep.say('🚧 build');
        }

        if (creep.memory.building) {
            const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
            if (constructionSites.length) {
                const extensionSites = _.filter(
                    constructionSites,
                    (site) => site.structureType === STRUCTURE_EXTENSION,
                );
                const sites = extensionSites.length ? extensionSites : constructionSites;
                const buildRes = creep.build(sites[0]);
                if (buildRes === ERR_NOT_IN_RANGE) {
                    creep.moveTo(sites[0], { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
        } else {
            const nonEmptyEnergySources = creep.room.find(FIND_SOURCES, {
                filter: (object) => {
                    return object.energy > 0;
                },
            });
            if (nonEmptyEnergySources.length) {
                const closestSource = creep.pos.findClosestByPath(nonEmptyEnergySources);
                if (closestSource) {
                    if (creep.harvest(closestSource) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(closestSource, { visualizePathStyle: { stroke: '#ffaa00' } });
                    }
                }
            }
            // TODO Since non empty sources are not found get source from storage
        }
    },
};

export default builder;
