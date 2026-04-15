import { State } from 'types';

const REPAIRABLE_TYPES = ['container', 'tower', 'rampart', 'road', 'spawn', 'extension', 'constructedWall'];
const REPAIR_PRIORITIES = {
    [STRUCTURE_CONTAINER]: 10, // critical storage
    [STRUCTURE_TOWER]: 9, // defense
    [STRUCTURE_SPAWN]: 9, // economy-critical
    [STRUCTURE_EXTENSION]: 9, // economy-critical
    [STRUCTURE_RAMPART]: 7, // defense + decays
    [STRUCTURE_WALL]: 5, // defense (no decay)
    [STRUCTURE_ROAD]: 2, // lowest
};

function getHitmax(target: Structure): number {
    if (target.structureType === STRUCTURE_RAMPART || target.structureType === STRUCTURE_WALL) {
        return target.hitsMax / 50;
    } else {
        return target.hitsMax;
    }
}

function getUrgency(structure: Structure): number {
    let health = structure.hits / getHitmax(structure);
    let urgency = REPAIR_PRIORITIES[structure.structureType as keyof typeof REPAIR_PRIORITIES] * (1 - health);
    return urgency;
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
            if (!target || getHitmax(target) <= target.hits) {
                const candidates = creep.room.find(FIND_STRUCTURES, {
                    filter: (s: Structure) => {
                        return REPAIRABLE_TYPES.includes(s.structureType) && s.hits < getHitmax(s);
                    },
                });
                if (!candidates.length) {
                    creep.memory.repairTarget = null;
                    return;
                }
                candidates.sort((a, b) => getUrgency(b) - getUrgency(a));
                target = candidates[0];
                creep.memory.repairTarget = target.id;
            }

            const repairResult = creep.repair(target as Structure);
            if (repairResult === ERR_NOT_IN_RANGE) {
                creep.moveTo(target as Structure, {
                    range: 3,
                    maxRooms: 1,
                    visualizePathStyle: { stroke: '#ffaa00', opacity: 0.6 },
                });
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
