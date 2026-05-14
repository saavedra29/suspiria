import { State } from 'types';
import { getFreeContainerId } from 'utils/utils';

const staticHarvester = {
    body: [WORK, WORK, CARRY, MOVE],
    name: 'staticHarvester',
    min: 0,
    color: '#b5ffbedc',
    initState: State.Harvest,

    run: (creep: Creep) => {
        const containerId = creep.memory.assignedContainer;
        if (containerId) {
            const container = Game.getObjectById(containerId);
            if (container) {
                if (creep.pos.getRangeTo(container) == 0) {
                    const source = creep.pos.findClosestByPath(FIND_SOURCES);
                    if (container.store.getFreeCapacity()) {
                        creep.harvest(source as Source);
                    }
                    // Check for not full link close and transfer if found
                    const links = creep.pos.findInRange(FIND_STRUCTURES, 1, {
                        filter: (s) => s.structureType === STRUCTURE_LINK,
                    });
                    const link = links.length ? (links[0] as StructureLink) : null;
                    if (!link) {
                        return;
                    }
                    const linkFreeCap = link.store.getFreeCapacity(RESOURCE_ENERGY);
                    const containerEnergy = container.store.getUsedCapacity(RESOURCE_ENERGY);
                    if (linkFreeCap !== 0 && containerEnergy + creep.store.energy !== 0) {
                        creep.withdraw(container, RESOURCE_ENERGY);
                        creep.transfer(link, RESOURCE_ENERGY);
                    }
                } else {
                    creep.moveTo(container);
                }
            } else {
                creep.memory.assignedContainer = null;
            }
        } else {
            const freeContainerId = getFreeContainerId(creep.room);
            if (freeContainerId) {
                _.set(creep, 'memory.assignedContainer', freeContainerId);
            }
        }
    },
};

export default staticHarvester;
