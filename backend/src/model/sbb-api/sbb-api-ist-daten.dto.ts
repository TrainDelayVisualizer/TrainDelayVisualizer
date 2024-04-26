
export interface SbbApiIstDatenDto {
    betriebstag: string;
    fahrt_bezeichner: string;
    betreiber_id: string;
    betreiber_abk: string;
    betreiber_name: string;
    produkt_id: string;
    linien_id: number;
    linien_text: string;
    umlauf_id: string;
    verkehrsmittel_text: string;
    zusatzfahrt_tf: boolean;
    faellt_aus_tf: boolean;
    bpuic: number;
    haltestellen_name: string;
    ankunftszeit: Date | null;
    an_prognose: Date | null;
    an_prognose_status: string;
    abfahrtszeit: Date | null;
    ab_prognose: Date | null;
    ab_prognose_status: string;
    durchfahrt_tf: boolean;
}
