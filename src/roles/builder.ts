import { State } from 'types';
import { loadEnergy } from 'utils/utils';

const BUILD_PRIORITY: BuildableStructureConstant[] = [
    STRUCTURE_SPAWN,
    STRUCTURE_TOWER,
    STRUCTURE_EXTENSION,
    STRUCTURE_CONTAINER,
    STRUCTURE_STORAGE,
    STRUCTURE_LINK,
    STRUCTURE_EXTRACTOR,
    STRUCTURE_TERMINAL,
    STRUCTURE_LAB,
    STRUCTURE_FACTORY,
    STRUCTURE_ROAD,
    STRUCTURE_NUKER,
    STRUCTURE_POWER_SPAWN,
    STRUCTURE_OBSERVER,
    STRUCTURE_RAMPART, // last — rampartRepairer handles upkeep
];

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
                // Find the highest priority type that has at least one site
                const priorityType = BUILD_PRIORITY.find((type) =>
                    constructionSites.some((s) => s.structureType === type),
                );

                const candidates = priorityType
                    ? constructionSites.filter((s) => s.structureType === priorityType)
                    : constructionSites;

                const target = candidates.reduce((best, site) => {
                    const bestRatio = best.progress / best.progressTotal;
                    const siteRatio = site.progress / site.progressTotal;

                    if (siteRatio > bestRatio) return site;
                    if (siteRatio === bestRatio) {
                        // tiebreak: prefer closer one
                        return creep.pos.getRangeTo(site) < creep.pos.getRangeTo(best) ? site : best;
                    }
                    return best;
                });

                if (creep.build(target) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
        } else loadEnergy(creep);
    },
};

export default builder;
