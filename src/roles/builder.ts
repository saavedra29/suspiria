import { State } from 'types';

const builder = {
    body: [WORK, CARRY, MOVE, MOVE],
    name: 'builder',
    min: 2,
    initState: State.Harvest,
    color: '#ffb5af',
    run: (creep: Creep) => {
        if (creep.memory.state === State.Build && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.state = State.Harvest;
            creep.say('🔄 harvest');
        }
        if (creep.memory.state === State.Harvest && creep.store.getFreeCapacity() === 0) {
            creep.memory.state = State.Build;
            creep.say('🚧 build');
        }

        if (creep.memory.state === State.Build) {
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
        }
    },
};

export default builder;
