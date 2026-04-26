interface Position {
    x: number;
    y: number;
}

/**
 * Interface for a single RCL level's bunker layout (exactly as in your circle.json).
 *
 * - "spawn" is always present and its FIRST position is { x: 0, y: 0 } (the anchor).
 * - All other keys are valid Screeps structure constants (e.g. "road", "extension", "tower", "storage", "link", "rampart", "terminal", "lab", "factory", "nuker", "powerSpawn").
 * - Every value is an array of relative positions.
 *
 * This matches your JSON 100% (7 levels → RCL 2 to RCL 8).
 */
interface BunkerLevel {
    spawn: Position[];
    road?: Position[];
    extension?: Position[];
    tower?: Position[];
    storage?: Position[];
    link?: Position[];
    rampart?: Position[];
    terminal?: Position[];
    lab?: Position[];
    factory?: Position[];
    nuker?: Position[];
    powerSpawn?: Position[];
    [structureType: string]: Position[] | undefined; // fallback for any future structures
}

/**
 * Full scheme loaded from circle.json.
 * scheme[0] = RCL 2 layout
 * scheme[1] = RCL 3 layout
 * ...
 * scheme[6] = RCL 8 layout
 */
export type BunkerScheme = BunkerLevel[];

/**
 * Call this every tick for every owned room (after you have loaded the scheme from circle.json).
 */
export function maintainBunker(room: Room, scheme: BunkerScheme): void {
    const controller = room.controller;
    if (!controller || controller.level < 2) {
        return;
    }

    const levelIndex = controller.level - 2;
    if (levelIndex < 0 || levelIndex >= scheme.length) {
        return;
    }

    const levelScheme = scheme[levelIndex];

    // Find the anchor spawn – user requested "Spawn1" specifically, fallback to any owned spawn
    let anchorSpawn = room.find(FIND_MY_SPAWNS).find((s) => s.name === 'Spawn1');
    if (!anchorSpawn) {
        anchorSpawn = room.find(FIND_MY_SPAWNS)[0];
    }
    if (!anchorSpawn) {
        return; // no spawn yet
    }

    const anchorX = anchorSpawn.pos.x;
    const anchorY = anchorSpawn.pos.y;

    // Build map: absolute "x,y" → SET of desired structure types (supports road + rampart etc.)
    const desired = new Map<string, Set<string>>();

    for (const [structureType, positions] of Object.entries(levelScheme)) {
        if (!Array.isArray(positions)) continue;

        for (const rel of positions) {
            const absX = anchorX + rel.x;
            const absY = anchorY + rel.y;

            if (absX < 0 || absX > 49 || absY < 0 || absY > 49) continue;

            const key = `${absX},${absY}`;
            if (!desired.has(key)) {
                desired.set(key, new Set<string>());
            }
            desired.get(key)!.add(structureType);
        }
    }

    // 1. Remove any construction site that is in the wrong place or has the wrong type
    // const allSites = room.find(FIND_CONSTRUCTION_SITES);
    // for (const site of allSites) {
    //     const key = `${site.pos.x},${site.pos.y}`;
    //     const wanted = desired.get(key);

    //     if (!wanted || site.structureType !== wanted) {
    //         site.remove();
    //     }
    // }

    // 2. Create missing construction sites exactly where the scheme says
    for (const [key, wantedTypeSet] of desired) {
        const [xStr, yStr] = key.split(',');
        const x = parseInt(xStr, 10);
        const y = parseInt(yStr, 10);

        const structuresHere = room.lookForAt(LOOK_STRUCTURES, x, y);
        const sitesHere = room.lookForAt(LOOK_CONSTRUCTION_SITES, x, y);

        const wantedTypes = Array.from(wantedTypeSet).sort((a, b) => {
            if (a === STRUCTURE_RAMPART) return 1;
            if (b === STRUCTURE_RAMPART) return -1;
            return 0;
        });

        for (const wantedType of wantedTypes) {
            if (wantedType === STRUCTURE_RAMPART) continue;

            const hasCorrectStructure = structuresHere.some((s) => s.structureType === wantedType);
            const hasCorrectSite = sitesHere.some((s) => s.structureType === wantedType);

            if (hasCorrectSite || hasCorrectStructure) continue;

            room.createConstructionSite(x, y, wantedType as BuildableStructureConstant);
            break;
        }

        if (wantedTypeSet.has(STRUCTURE_RAMPART)) {
            const nonRampartTypes = wantedTypes.filter((t) => t !== STRUCTURE_RAMPART);
            const allNonRampartsBuilt = nonRampartTypes.every((t) => structuresHere.some((s) => s.structureType === t));
            if (allNonRampartsBuilt) {
                const hasRampart = structuresHere.some((s) => s.structureType === STRUCTURE_RAMPART);
                const hasRamaprtSite = sitesHere.some((s) => s.structureType === STRUCTURE_RAMPART);

                if (!hasRampart && !hasRamaprtSite) {
                    room.createConstructionSite(x, y, STRUCTURE_RAMPART as BuildableStructureConstant);
                }
            }
        }
    }
}
