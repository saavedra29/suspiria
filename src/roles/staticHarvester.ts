import { State } from 'types';

const staticHarvester = {
    body: [WORK, WORK, MOVE],
    name: 'staticHarvester',
    min: 0,
    color: '#b5ffbedc',
    initState: State.Harvest,

    run: (creep: Creep) => {
        const container = Game.getObjectById(creep.memory.assignedContainer as Id<StructureContainer>);
        if (!container) {
            console.log('Static harvester problem: Container not found');
        } else {
            if (creep.pos.getRangeTo(container) == 0) {
                const source = creep.pos.findClosestByPath(FIND_SOURCES);
                if (container.store.getFreeCapacity()) {
                    creep.harvest(source as Source);
                }
            } else {
                creep.moveTo(container);
            }
        }
    },
};

export default staticHarvester;
