import { Service } from "typedi";
import { Prisma } from "@prisma/client";
import { DataAccessClient } from "../database/data-access.client";
import { SectionFilterDto } from "../model/section-filter.dto";
import { SectionSummaryDto } from "../model/section-summary.dto";
import { ListUtils } from "../utils/list.utils";
import { TrainSectionDtoMapper } from "../mappers/train-section.mapper";

@Service()
export class SectionService {
    constructor(
        private readonly dataAccess: DataAccessClient,
    ) { }

    async getSectionsByFilter(filter: SectionFilterDto) {
        const whereFilter: Prisma.SectionWhereInput = this.buildQueryBySectionFilter(filter);
        const sections = await this.dataAccess.client.section.findMany({
            relationLoadStrategy: "join", // join on database level and not on application level
            where: whereFilter,
            include: {
                trainRide: {
                    include: {
                        line: true,
                    },
                },
                stationFrom: true,
                stationTo: true
            },
        });

        const groupedSections = ListUtils.groupBy(sections, (section) => `${section.stationFromId}-${section.stationToId}`);

        const retVal: SectionSummaryDto[] = [];
        for (const sameSections of groupedSections.values()) {
            if (sameSections.length === 0) {
                continue;
            }
            const sectionSummaryDto = TrainSectionDtoMapper.mapSameSectionsToSectionSummaryDto(sameSections);
            if (filter.delaysOnly && sectionSummaryDto.averageArrivalDelay === 0 && sectionSummaryDto.averageDepartureDelay === 0) {
                continue;
            }
            retVal.push(sectionSummaryDto);
        }
        return retVal;
    }

    buildQueryBySectionFilter(filter: SectionFilterDto) {
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
        return whereFilter;
    }
}