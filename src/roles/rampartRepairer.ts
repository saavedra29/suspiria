import { State } from 'types';
import config from '../config.json';

const rampartRepairer = {
    body: [WORK, CARRY, CARRY, MOVE, MOVE], // tweak as needed
    name: 'rampartRepairer',
    min: 0, // start with 1, increase based on # of ramparts / RCL
    initState: State.Harvest,
    color: '#ff00ff', // whatever you like

    run: (creep: Creep) => {
        if (creep.memory.state === State.Repair && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.state = State.Harvest;
            creep.say('🔄 harvest');
        }
        if (creep.memory.state === State.Harvest && creep.store.getFreeCapacity() === 0) {
            creep.memory.state = State.Repair;
            creep.say('🛡️ rampart');
        }

        if (creep.memory.state === State.Repair) {
            // === ALWAYS re-select the lowest-hits rampart (no sticking) ===
            const candidates = creep.room.find(FIND_STRUCTURES, {
                filter: (s: Structure) => s.structureType === STRUCTURE_RAMPART && s.hits < s.hitsMax / 50, // or use your getHitmax logic, or a config value
            });

            if (!candidates.length) {
                // everything is "good enough" → idle or help main repairer if you want
                return;
            }

            // Sort by absolute hits (lowest first) → natural balancing
            candidates.sort((a, b) => a.hits - b.hits);

            const target = candidates[0];

            const repairResult = creep.repair(target);

            if (repairResult === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {
                    range: 3,
                    maxRooms: 1,
                    visualizePathStyle: { stroke: '#ff00ff' },
                });
            } else if (repairResult === OK) {
                // optional: small visual feedback
                // creep.say('🔨', true);
            }
        } else {
            // Harvest logic – exactly the same as your repairer (containers first, then sources)
            const nonEmptyContainers: Array<StructureContainer> = creep.room.find(FIND_STRUCTURES, {
                filter: (s) =>
                    s.structureType === STRUCTURE_CONTAINER &&
                    (s as StructureContainer).store.getUsedCapacity(RESOURCE_ENERGY) > 0,
            });

            if (nonEmptyContainers.length) {
                const closest = creep.pos.findClosestByPath(nonEmptyContainers);
                if (closest && creep.withdraw(closest, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(closest, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            } else {
                const nonEmptySources = creep.room.find(FIND_SOURCES, {
                    filter: (s) => s.energy > 0,
                });
                const closestSource = creep.pos.findClosestByPath(nonEmptySources);
                if (closestSource && creep.harvest(closestSource) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestSource, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            }
        }
    },
};

export default rampartRepairer;
