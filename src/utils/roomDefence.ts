function roomDefence(room: Room) {
    const towers = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });

    if (towers.length) {
        _.forEach(towers, (tower: StructureTower) => {
            const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (closestHostile) {
                tower.attack(closestHostile);
            }
            // TODO If possible also repair constructions or heal my creeps
        });
    }

    // TODO Create invaders in case of under attack
}

export default roomDefence;
