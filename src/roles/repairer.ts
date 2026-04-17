import { State } from 'types';
import config from '../config.json';

const REPAIRABLE_TYPES = ['container', 'tower', 'rampart', 'road', 'spawn', 'extension', 'constructedWall'];
const REPAIR_PRIORITIES = {
    [STRUCTURE_CONTAINER]: config.repair_priorities.container,
    [STRUCTURE_TOWER]: config.repair_priorities.tower,
    [STRUCTURE_SPAWN]: config.repair_priorities.spawn,
    [STRUCTURE_EXTENSION]: config.repair_priorities.extension,
    [STRUCTURE_RAMPART]: config.repair_priorities.rampart,
    [STRUCTURE_WALL]: config.repair_priorities.wall,
    [STRUCTURE_ROAD]: config.repair_priorities.road,
};

function getHitmax(target: Structure): number {
    if (target.structureType === STRUCTURE_RAMPART || target.structureType === STRUCTURE_WALL) {
        return target.hitsMax / 50;
    } else {
        return target.hitsMax;
    }
}

function getThreshold(structure: Structure, fullRepairMode: boolean): number {
    if (
        fullRepairMode &&
        (structure.structureType === STRUCTURE_RAMPART || structure.structureType === STRUCTURE_WALL)
    ) {
        return structure.hitsMax; // full over-repair
    }
    return getHitmax(structure); // normal mode (walls/ramparts only to /50)
}

function getUrgencyForMode(structure: Structure, fullRepairMode: boolean): number {
    const targetHits = getThreshold(structure, fullRepairMode);
    if (targetHits <= 0) return 0;
    const health = structure.hits / targetHits;
    return REPAIR_PRIORITIES[structure.structureType as keyof typeof REPAIR_PRIORITIES] * (1 - health);
}

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
            let target = Game.getObjectById(creep.memory.repairTarget as Id<_HasId>) as Structure | null;

            // Decide current mode
            const normalNeeds = creep.room.find(FIND_STRUCTURES, {
                filter: (s: Structure) => REPAIRABLE_TYPES.includes(s.structureType) && s.hits < getHitmax(s),
            });
            const isFullRepairMode = normalNeeds.length === 0;

            // Check if current target is still valid for the current mode
            const getCurrentThreshold = (s: Structure) => getThreshold(s, isFullRepairMode);
            const isTargetValid =
                target && REPAIRABLE_TYPES.includes(target.structureType) && target.hits < getCurrentThreshold(target);

            if (!isTargetValid) {
                // Pick a new target
                let candidates: Structure[];

                if (isFullRepairMode) {
                    // Full repair mode: only walls/ramparts up to absolute hitsMax
                    candidates = creep.room.find(FIND_STRUCTURES, {
                        filter: (s: Structure) =>
                            (s.structureType === STRUCTURE_RAMPART || s.structureType === STRUCTURE_WALL) &&
                            s.hits < s.hitsMax,
                    });
                } else {
                    // Normal mode - exactly like your original code
                    candidates = normalNeeds;
                }

                if (!candidates.length) {
                    creep.memory.repairTarget = null;
                    return; // everything is at maximum → idle
                }

                // Sort by urgency in the current mode
                candidates.sort(
                    (a, b) => getUrgencyForMode(b, isFullRepairMode) - getUrgencyForMode(a, isFullRepairMode),
                );

                target = candidates[0];
                creep.memory.repairTarget = target.id;
            }

            // === SAFE REPAIR (target is guaranteed to exist here) ===
            if (target) {
                const repairResult = creep.repair(target);

                if (repairResult === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {
                        range: 3,
                        maxRooms: 1,
                        visualizePathStyle: { stroke: '#ffffff' },
                    });
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

export default repairer;
