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
            if (rampartIds.length === 0) {
                creep.memory.repairTarget = null;
                return;
            }

            if (!creep.memory.repairTarget) {
                creep.memory.repairTarget = creep.room.memory.rampartIdsAscHitpoints.shift();
            } else {
                const target = Game.getObjectById(creep.memory.repairTarget);
                const possibleNextTarget = Game.getObjectById(
                    creep.room.memory.rampartIdsAscHitpoints[0] as Id<_HasId>,
                ) as StructureRampart;
                if (!target) {
                    creep.memory.repairTarget = creep.room.memory.rampartIdsAscHitpoints.shift();
                } else {
                    const targetBelowAllowed = target.hits < config.rampart.lowestHitsAllowed;
                    const possibleNextBelowAllowed = possibleNextTarget.hits < config.rampart.lowestHitsAllowed;
                    if (possibleNextBelowAllowed && !targetBelowAllowed) {
                        creep.memory.repairTarget = creep.room.memory.rampartIdsAscHitpoints.shift();
                    }
                }
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
