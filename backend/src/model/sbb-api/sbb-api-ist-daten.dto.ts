import { SbbGeopositionDto } from "./sbb-geoposition.dto";

export interface SbbApiIstDatenDto {
    betriebstag: string;
    fahrt_bezeichner: string;
    betreiber_id: string;
    betreiber_abk: string;
    betreiber_name: string;
    produkt_id: string;
    linien_id: number;
    linien_text: string;
    umlauf_id: null;
    verkehrsmittel_text: string;
    zusatzfahrt_tf: string;
    faellt_aus_tf: string;
    bpuic: number;
    haltestellen_name: string;
    ankunftszeit: string;
    an_prognose: string;
    an_prognose_status: string;
    abfahrtszeit: null;
    ab_prognose: null;
    ab_prognose_status: null;
    durchfahrt_tf: string;
    ankunftsverspatung: string;
    abfahrtsverspatung: string;
    lod: string;
    geopos: SbbGeopositionDto;
}
