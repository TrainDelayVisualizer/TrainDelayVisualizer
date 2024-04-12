import { Service } from "typedi";
import { Prisma, Section } from "@prisma/client";
import { DataAccessClient } from "../database/data-access.client";
import { SectionFilterDto } from "../model/section-filter.dto";

@Service()
export class SectionService {
    constructor(
        private readonly dataAccess: DataAccessClient,
    ) { }

    async getSectionsByFilter(filter: SectionFilterDto) {

        let whereFilter: Prisma.SectionWhereInput = {
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
            whereFilter = {
                ...whereFilter,
                trainRide: {
                    line: {
                        trainType: filter.trainType,
                    }
                }
            };
        }

        if (filter.trainLine) {
            whereFilter = {
                ...whereFilter,
                trainRide: {
                    line: {
                        name: filter.trainLine,
                    }
                }
            };
        }

        const sections = await this.dataAccess.client.section.findMany({
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

        const sectionsMap = new Map<string, typeof sections>();
        for (const section of sections) {
            const key = `${section.stationFromId}-${section.stationToId}`;
            const sectionsFromKey = sectionsMap.get(key)
            if (!sectionsFromKey) {
                sectionsMap.set(key, [section]);
            } else {
                sectionsFromKey.push(section);
            }
        }

        const retVal = [];
        for (const sameSections of sectionsMap.values()) {
            if (sameSections.length === 0) {
                continue;
            }

            const sectionDto = {
                stationFrom: sameSections[0].stationFrom,
                stationTo: sameSections[0].stationTo,
                departureDelay: 0,
                arrivalDelay: 0
            };
            retVal.push(sectionDto);

            for (const section of sameSections) {
                const delayDeparture = this.caluclateDeparturesDelayMinutes(section);
                sectionDto.departureDelay = delayDeparture;
                const delayArrival = this.calculateArrivalDelayMinutes(section);
                sectionDto.arrivalDelay += delayArrival;
            }
        }
        return retVal;
    }

    private caluclateDeparturesDelayMinutes(section: Section,) {
        const plannedStart = section.plannedDeparture;
        const actualStart = section.actualDeparture;
        if (!plannedStart || !actualStart) {
            return 0;
        }
        const diff = actualStart.getTime() - plannedStart.getTime();
        return Math.floor(diff / 60000);
    }

    private calculateArrivalDelayMinutes(section: Section) {
        const plannedArrival = section.plannedArrival;
        const actualArrival = section.actualArrival;
        if (!plannedArrival || !actualArrival) {
            return 0;
        }
        const diff = actualArrival.getTime() - plannedArrival.getTime();
        return Math.floor(diff / 60000);
    }
}