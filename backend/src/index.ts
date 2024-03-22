import 'reflect-metadata';
import { startServer } from './server';
import Container from 'typedi';
import { ApiImportService } from './services/import.service';
import { CommandExecutorUtils } from './utils/command-executor.utils';
import { JobSchedulerService } from './services/job-scheduler.service';
import { ApiImportJob } from './jobs/api-import.job';

console.log('************************');
console.log(`* TrainDelayVisualizer *`);
console.log('************************');

async function init() {
    if (process.env.NODE_ENV === 'production') {
        await CommandExecutorUtils.runCommand('cd /app/backend && npm run prisma-deploy');
        await Container.get(JobSchedulerService).configureAndScheduleJobs();
        await Container.get(JobSchedulerService).runAllJobs();
        console.log('Scheduled Jobs successfully.');
    }
    startServer();
}
init();
