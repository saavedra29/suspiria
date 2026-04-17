import { State } from 'types';
import { getFreeContainerId } from 'utils/utils';

const staticHarvester = {
    body: [WORK, WORK, MOVE],
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
