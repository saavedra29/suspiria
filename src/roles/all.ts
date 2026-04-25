import builder from 'roles/builder';
import hauler from 'roles/hauler';
import repairer from 'roles/repairer';
import staticHarvester from 'roles/staticHarvester';
import upgrader from 'roles/upgrader';
import meleeFighter from './meleeFighter';
import rampartRepairer from './rampartRepairer';

const roles = [hauler, builder, staticHarvester, repairer, rampartRepairer, upgrader, meleeFighter].reverse();
export default roles;
