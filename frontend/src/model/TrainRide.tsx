import { Section } from "./Section";

export type TrainRide = {
  name: string;
  lineName: string;
  sections: Array<Section>;
};