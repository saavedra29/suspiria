import builder from 'roles/builder';
import hauler from 'roles/hauler';
import repairer from 'roles/repairer';
import staticHarvester from 'roles/staticHarvester';
import upgrader from 'roles/upgrader';
import meleeFighter from './meleeFighter';
import rampartRepairer from './rampartRepairer';
import storageLoader from './storageLoader';

const roles = [
    hauler,
    builder,
    staticHarvester,
    storageLoader,
    repairer,
    rampartRepairer,
    upgrader,
    meleeFighter,
].reverse();
export default roles;
