import { State } from 'types';

const storageLoader = {
    body: [WORK, WORK, CARRY, MOVE],
    name: 'storageLoader',
    min: 0,
    color: '#00926e',
    initState: State.Harvest,

    run: (creep: Creep) => {
        const storageLinkId = creep.memory.assignedStorageLink;
        if (storageLinkId) {
            const link = Game.getObjectById(storageLinkId);
            if (link) {
                const storageLoaderPos = new RoomPosition(link.pos.x, link.pos.y - 1, creep.room.name);
                if (creep.pos.getRangeTo(storageLoaderPos) === 0) {
                    const storage: StructureStorage | null = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (s) => s.structureType === STRUCTURE_STORAGE,
                    });
                    if (storage) {
                        if (
                            link.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
                            storage.store.getFreeCapacity(RESOURCE_ENERGY) !== 0
                        ) {
                            creep.withdraw(link, RESOURCE_ENERGY);
                            creep.transfer(storage, RESOURCE_ENERGY);
                        }
                    }
                } else {
                    creep.moveTo(storageLoaderPos);
                }
            } else {
                creep.memory.assignedStorageLink = null;
            }
        } else {
            const storageLinkId = creep.room.memory.storageLinkId;
            if (storageLinkId) {
                _.set(creep, 'memory.assignedStorageLink', storageLinkId);
            }
        }
    },
};

export default storageLoader;
