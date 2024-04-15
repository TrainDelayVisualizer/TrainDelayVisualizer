import { Service } from "typedi";
import { SectionService } from "../services/section.service";
import { SectionFilterDto } from "../model/section-filter.dto";

@Service()
export class SectionController {
    constructor(private readonly sectionService: SectionService) { }

    async getSectionsByFilter(filter: SectionFilterDto) {
        return await this.sectionService.getSectionsByFilter(filter);
    }
}
