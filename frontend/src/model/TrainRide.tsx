import { Section, SectionDTO } from "./Section";

export type TrainRide = {
    name: string,
    lineName: string,
    sections: Array<Section>,
    plannedStart: string,
};

export type TrainRideDTO = {
    name: string,
    lineName: string,
    sections: Array<SectionDTO>,
    plannedStart: string,
};
