import { spawn } from 'child_process';
import { State } from 'types';

function _getBody(segment: Array<BodyPartConstant>, room: Room, zero_hauler: boolean): Array<BodyPartConstant> {
    let body: Array<BodyPartConstant> = [];
    const segmentCost = _.sum(segment, (s) => BODYPART_COST[s]);
    let maxSegments: number;
    if (zero_hauler) {
        maxSegments = Math.floor(room.energyAvailable / segmentCost);
    } else {
        maxSegments = Math.floor(room.energyCapacityAvailable / segmentCost);
    }
    _.times(maxSegments, () => {
        _.forEach(segment, (s) => body.push(s));
    });

    if (body.length <= 50) {
        return body;
    } else {
        return body.slice(0, 50);
    }
}

function _getFreeContainerId(room: Room): string | null {
    const containers = room.find(FIND_STRUCTURES, {
        filter: { structureType: STRUCTURE_CONTAINER },
    });
    const assignedIds = Object.values(Game.creeps)
        .filter((c) => c.memory.role === 'staticHarvester' && c.memory.assignedContainer)
        .map((c) => c.memory.assignedContainer);
    const freeContainer = containers.find((c) => !assignedIds.includes(c.id));
    return freeContainer ? freeContainer.id : null;
}

function regulateRoleSpawn(room: Room, role: Role) {
    const myRoomCreeps = room.find(FIND_MY_CREEPS);
    const roleCreeps = _.filter(myRoomCreeps, (cr) => cr.memory.role === role.name);
    if (roleCreeps.length < _.get(room.memory, ['census', role.name], role.min)) {
        const freeSpawn = room.find(FIND_MY_SPAWNS).filter((sp) => !sp.spawning)[0];
        // TODO Take care for cases of Power Spawns
        if (!freeSpawn) {
            return;
        }
        const newCreepName = role.name + Game.time;
        let spawnResult: number | null = null;
        if (role.name === 'hauler' && roleCreeps.length < 1) {
            spawnResult = freeSpawn.spawnCreep(_getBody(role.body, room, true), newCreepName, {
                memory: { role: role.name, state: State.Harvest },
            });
        } else if (role.name === 'staticHarvester') {
            const containerId = _getFreeContainerId(room);
            if (containerId) {
                const body = _getBody(role.body, room, false);
                spawnResult = freeSpawn.spawnCreep(body, newCreepName, {
                    memory: { role: role.name, state: State.Harvest, assignedContainer: containerId },
                });
            } else {
                console.log('No container for static harvester. Spawn aborted!');
            }
        } else {
            spawnResult = freeSpawn.spawnCreep(_getBody(role.body, room, false), newCreepName, {
                memory: { role: role.name, state: role.initState },
            });
        }
        if (spawnResult === OK) {
            console.log(`Spawning new ${role.name} at room ${room.name}`);
        }
    }
}

export default regulateRoleSpawn;
