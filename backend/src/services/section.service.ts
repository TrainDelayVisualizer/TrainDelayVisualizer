import { Service } from "typedi";
import { SectionFilterDto } from "../model/section-filter.dto";
import { SectionSummaryDto } from "../model/section-summary.dto";
import { Pool, spawn, Worker } from "threads";
import { Prisma } from "@prisma/client";

@Service()
export class SectionService {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static threadPool?: Pool<any>;

    private initThreadPool() {
        if (!SectionService.threadPool) {
            SectionService.threadPool = Pool(() => spawn(new Worker("./thread-services/get-sections-by-filter.thread-service.js")));
        }
    }

    async getSectionsByFilter(filter: SectionFilterDto) {
        /**
         * Extracting the query to a separate thread because PrismaORM creates a massive
         * overhead when querying > 100'000 records.
         */
        this.initThreadPool();
        return await SectionService.threadPool!.queue((auth) =>
            auth.getSectionsByFilterThread(filter, SectionService.buildQueryBySectionFilter(filter)) as Promise<SectionSummaryDto[]>);
    }

    static buildQueryBySectionFilter(filter: SectionFilterDto) {
        const whereFilter: Prisma.SectionWhereInput = {
            trainRide: {
                plannedStart: {
                    gte: filter.from
                },
                plannedEnd: {
                    lte: filter.to
                }
            }
        };

        if (filter.trainType) {
            whereFilter.trainRide!.line = {
                trainType: filter.trainType
            };
        }

        if (filter.trainLine) {
            whereFilter.trainRide!.lineName = filter.trainLine;
        }

        if (filter.trainOperator) {
            whereFilter.trainRide!.line = {
                trainType: filter.trainType,
                operator: filter.trainOperator,
            };
        }
        return whereFilter;
    }
}