import { TrainRide } from "@prisma/client";
import { SectionDto } from "./section.dto";

export interface TrainRideDto extends TrainRide {

}

export interface TrainRideWithSectionsDto extends TrainRideDto {
    sections: SectionDto[];
}