import hauler from 'roles/hauler';
import upgrader from 'roles/upgrader';
import builder from 'roles/builder';
import repairer from 'roles/repairer';
import staticHarvester from 'roles/staticHarvester';

const roles = [hauler, builder, staticHarvester, upgrader, repairer].reverse();
export default roles;
