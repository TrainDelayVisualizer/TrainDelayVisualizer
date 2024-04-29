import { Section } from "../Section";

export type TrainLineViewProps = {
  selected: boolean,
  onSelect: () => void,
  name: string,
  lineName: string,
  sections: Array<Section>,
  filterDate: Date,
};