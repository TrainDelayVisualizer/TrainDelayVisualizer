import 'reflect-metadata';
import { startServer } from './server';
import Container from 'typedi';
import { ApiImportService } from './services/import.service';
import { CommandExecutorUtils } from './utils/command-executor.utils';

console.log('************************');
console.log(`* TrainDelayVisualizer *`);
console.log('************************');

async function init() {
    if (process.env.NODE_ENV === 'production') {
        await CommandExecutorUtils.runCommand('cd /app/backend && npm run prisma-deploy');
    }
    // Auskommentieren, um den Import zu starten
    Container.get(ApiImportService).runFullImport();
    
    startServer();
}
init();
