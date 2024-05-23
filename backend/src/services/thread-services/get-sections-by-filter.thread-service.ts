import { Prisma, PrismaClient } from "@prisma/client";
import { expose } from "threads";
import { TrainSectionDtoMapper } from "../../mappers/train-section.mapper";
import { SectionFilterDto } from "../../model/section-filter.dto";
import { SectionSummaryDto } from "../../model/section-summary.dto";
import { ListUtils } from "../../utils/list.utils";

expose({
    async getSectionsByFilterThread(filter: SectionFilterDto, prismaWhereFilter: Prisma.SectionWhereInput) {

        const prismaClient = new PrismaClient();

        try {
            const sections = await prismaClient.section.findMany({
                select: {
                    plannedArrival: true,
                    plannedDeparture: true,
                    actualArrival: true,
                    actualDeparture: true,
                    stationFrom: true,
                    stationTo: true
                },
                relationLoadStrategy: "join", // join on database level and not on application level
                where: prismaWhereFilter,
            });
            const groupedSections = ListUtils.groupBy(sections, (section) => `${section.stationFrom.id}-${section.stationTo.id}`);

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
        } finally {
            await prismaClient.$disconnect();
        }
    }
});
