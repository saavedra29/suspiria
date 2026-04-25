import { State } from 'types';

const meleeFighter = {
    body: [ATTACK, MOVE, ATTACK, MOVE],
    name: 'meleeFighter',
    min: 1,
    color: '#ff3232',
    initState: State.Fight,

    run: (creep: Creep) => {
        if (creep.memory.state === State.Fight) {
            const closestEnemy = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
            if (closestEnemy) {
                const result = creep.attack(closestEnemy);
                if (result === ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestEnemy.pos);
                }
            }
        }
    },
};

export default meleeFighter;
