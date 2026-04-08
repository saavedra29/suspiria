import { State } from 'types';

function _getBody(segment: Array<BodyPartConstant>, room: Room, zero_harvester: boolean): Array<BodyPartConstant> {
    let body: Array<BodyPartConstant> = [];
    const segmentCost = _.sum(segment, (s) => BODYPART_COST[s]);
    let maxSegments: number;
    if (zero_harvester) {
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

function regulateRoleSpawn(room: Room, role: Role) {
    if (role.name === 'builder' && Object.keys(room.find(FIND_MY_CONSTRUCTION_SITES)).length === 0) {
        return;
    }

    const myRoomCreeps = room.find(FIND_MY_CREEPS);
    const roleCreeps = _.filter(myRoomCreeps, (cr) => cr.memory.role === role.name);
    if (roleCreeps.length < _.get(room.memory, ['census', role.name], role.min)) {
        const freeSpawn = room.find(FIND_MY_SPAWNS).filter((sp) => !sp.spawning)[0];
        // TODO Take care for cases of Power Spawns
        if (!freeSpawn) {
            return;
        }
        const newCreepName = role.name + Game.time;
        let spawnResult: number;
        if (role.name === 'harvester' && roleCreeps.length < 1) {
            spawnResult = freeSpawn.spawnCreep(_getBody(role.body, room, true), newCreepName, {
                memory: { role: role.name, state: State.Harvest },
            });
        } else {
            spawnResult = freeSpawn.spawnCreep(_getBody(role.body, room, false), newCreepName, {
                memory: { role: role.name, state: role.initState },
            });
        }
        if (spawnResult == OK) {
            console.log(`Spawning new ${role.name} at room ${room.name}`);
        }
    }
}

export default regulateRoleSpawn;
