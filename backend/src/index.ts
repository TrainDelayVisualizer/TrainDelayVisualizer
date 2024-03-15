import 'reflect-metadata';
import { startServer } from './server';
import Container from 'typedi';
import { ApiImportService } from './services/import.service';

console.log('************************');
console.log(`* TrainDelayVisualizer *`);
console.log('************************');

startServer();

// Auskommentieren, um den Import zu starten
 Container.get(ApiImportService).runFullImport();