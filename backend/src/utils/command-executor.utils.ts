import util from 'util';
import child_process from 'child_process';
import logger from './logger.utils';

export class CommandExecutorUtils {
    static async runCommand(command: string) {
        if (!command) {
            throw new Error('cannot run an empty command');
        }
        try {
            //logger.info('Running command: "' + command + '"...');
            const exec = util.promisify(child_process.exec);

            const { stdout, stderr } = await exec(command);
            logger.info('stdout:\n', stdout);
            logger.info('stderr:\n', stderr);
        } catch (err) {
            console.error('Error while running command: +' + command + '":');
            console.error(err);
        }
    }
}