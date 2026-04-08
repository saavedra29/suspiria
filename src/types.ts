declare global {
    /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definition alone.
    You must also give them an implementation if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)
    
    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
    */
    // Memory extension samples
    interface Memory {
        uuid: number;
        log: any;
    }

    interface CreepMemory {
        role: string;
        room: string;
        working?: boolean;
        state?: string;
        upgrading?: boolean;
        building?: boolean;
        repairing?: boolean;
    }

    interface RoomMemory {
        census?: {
            harvester: number;
        };
    }

    interface Role {
        body: Array<BodyPartConstant>;
        name: string;
        min: number;
        // (creep: Creep): void;
        run: (c: Creep) => void;
    }
}
// Syntax for adding properties to `global` (ex "global.log")
declare const global: {
    log: any;
};

export {};
