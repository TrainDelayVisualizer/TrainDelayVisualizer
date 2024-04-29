import { Station } from "../Station";
import { Section } from "../Section";

export type StationViewProps = {
    station: Station,
    showSections: (sections: Array<Section> | null) => void,
};