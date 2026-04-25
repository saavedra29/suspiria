import { State } from 'types';
import { loadEnergy } from 'utils/utils';
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
            let rampartIds = creep.room.memory.rampartIdsAscHitpoints;
            if (!rampartIds.length) {
                creep.memory.repairTarget = null;
            } else if (Game.getObjectById(rampartIds[0])!.hits < config.rampart.lowestHitsAllowed) {
                creep.memory.repairTarget = rampartIds.shift();
            }
            if (creep.memory.repairTarget) {
                const target = Game.getObjectById(creep.memory.repairTarget);
                if (target) {
                    const repairResult = creep.repair(target);
                    if (repairResult === ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {
                            range: 3,
                            maxRooms: 1,
                            visualizePathStyle: { stroke: '#ff00ff' },
                        });
                    }
                }
            }
        } else {
            loadEnergy(creep);
        }
    },
};

export default rampartRepairer;
