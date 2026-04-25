import { State } from 'types';
import { loadEnergy } from 'utils/utils';

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
            loadEnergy(creep);
        } else if (creep.memory.state === State.Load) {
            const spawns = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType === STRUCTURE_SPAWN && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
            });
            const extensions = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType === STRUCTURE_EXTENSION && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
            });
            const towers = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType === STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
            });
            const storages = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType === STRUCTURE_STORAGE && s.store.getCapacity(RESOURCE_ENERGY) > 0,
            });
            const targets = spawns.length ? spawns : extensions.length ? extensions : towers.length ? towers : storages;
            if (targets.length) {
                const closestTarget = creep.pos.findClosestByPath(targets);
                if (closestTarget) {
                    if (creep.transfer(closestTarget, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(closestTarget, { visualizePathStyle: { stroke: '#ffffff' } });
                    }
                }
            }
        }
    },
};

export default hauler;
