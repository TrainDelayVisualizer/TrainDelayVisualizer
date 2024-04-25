import 'reflect-metadata';
import { startServer } from './server';
import Container from 'typedi';
import { CommandExecutorUtils } from './utils/command-executor.utils';
import { JobSchedulerService } from './services/job-scheduler.service';
import logger from './utils/logger.utils';
import { ApiImportService } from './services/import.service';

logger.info('************************');
logger.info(`* TrainDelayVisualizer *`);
logger.info('************************');

logger.info('TrainDelayVisualizer Logger Test');

async function init() {
    if (process.env.NODE_ENV === 'production') {
        await CommandExecutorUtils.runCommand('cd /app/backend && npm run prisma-deploy');
        await Container.get(JobSchedulerService).configureAndScheduleJobs();
        await Container.get(JobSchedulerService).runAllJobs();
        logger.info('Scheduled Jobs successfully.');
    }
    await Container.get(ApiImportService).runFullImport();
    startServer();
}
init();
