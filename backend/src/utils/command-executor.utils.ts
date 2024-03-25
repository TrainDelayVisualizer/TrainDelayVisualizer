import util from 'util';
import child_process from 'child_process';

export class CommandExecutorUtils {
    static async runCommand(command: string) {
        if (!command) {
            throw new Error('cannot run an empty command');
        }
        try {
            //console.log('Running command: "' + command + '"...');
            const exec = util.promisify(child_process.exec);

            const { stdout, stderr } = await exec(command);
            console.log('stdout:\n', stdout);
            console.log('stderr:\n', stderr);
        } catch (err) {
            console.error('Error while running command: +' + command + '":');
            console.error(err);
        }
    }
}