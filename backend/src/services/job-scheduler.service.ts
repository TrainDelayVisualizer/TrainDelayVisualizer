import PgBoss, { ScheduleOptions } from "pg-boss";
import Container, { Constructable, Service } from "typedi";
import { EnvUtils } from "../utils/env.utils";
import { IJob } from "../jobs/job.interface";
import { ApiImportJob } from "../jobs/api-import.job";

@Service()
export class JobSchedulerService {

    private boss?: PgBoss;
    private jobs: Map<Constructable<IJob>, string>;

    constructor() {
        // Job Configuration
        this.jobs = new Map<Constructable<IJob>, string>([
            [ApiImportJob, '0 */1 * * *'], // every hour
        ]);
    }

    private async init() {
        this.boss = new PgBoss(EnvUtils.get().databaseUrl);
        await this.boss.start();
    }

    /**
     * Configures and schedules all jobs defined in the jobs map.
     * 
     * PG-Boss Documentation: https://github.com/timgit/pg-boss/blob/master/docs/readme.md
     */
    async configureAndScheduleJobs() {
        if (!this.boss) {
            await this.init();
        }

        // Create work for each job
        for (let [jobClass, cronExpression] of this.jobs) {
            await this.boss!.work(jobClass.name, async (job) => {
                await this.runJob(jobClass);
            });
        }

        // schedule jobs
        for (let [jobClass, cronExpression] of this.jobs) {
            if (!cronExpression) {
                continue;
            }
            await this.boss!.schedule(jobClass.name, cronExpression, {
                retryLimit: 0,
                expireInHours: 1,
                tz: 'Europe/Zurich'
            } as ScheduleOptions);
        }
    }

    async runAllJobs() {
        if (!this.boss) {
            throw new Error('JobSchedulerService not initialized.');
        }

        for (let [jobClass, cronExpression] of this.jobs) {
            this.boss.send(jobClass.name, {});
        }
    }

    private async runJob(jobClass: Constructable<IJob>) {
        const startTime = new Date().getTime();
        if (jobClass.name) {
            console.log(`[${new Date().toISOString()}] Starting Job ${jobClass.name}.`); // todo durch logging library ersetzten
        }
        try {
            await Container.get(jobClass).run();
        } catch (e) {
            console.error(`[${new Date().toISOString()}] Error while running Job ${jobClass.name}`, e);
        } finally {
            const endTime = new Date().getTime();
            const executionTime = endTime - startTime;
            console.log(`[${new Date().toISOString()}] Ended Job ${jobClass.name} after ${executionTime} milliseconds`);
        }
    }
}