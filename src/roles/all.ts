import hauler from 'roles/hauler';
import upgrader from 'roles/upgrader';
import builder from 'roles/builder';
import repairer from 'roles/repairer';
import rampartRepairer from './rampartRepairer';
import staticHarvester from 'roles/staticHarvester';

const roles = [hauler, builder, staticHarvester, repairer, rampartRepairer, upgrader].reverse();
export default roles;
