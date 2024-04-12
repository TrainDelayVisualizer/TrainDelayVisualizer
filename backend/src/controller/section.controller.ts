import { Service } from "typedi";
import { SectionService } from "../services/section.service";

@Service()
export class SectionController {
    constructor(private readonly sectionService: SectionService) { }

}
