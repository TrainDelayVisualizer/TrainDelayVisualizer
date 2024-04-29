import { SbbApiIstDatenDto } from "../model/sbb-api/sbb-api-ist-daten.dto";
import { DateUtils } from "../utils/date.utils";

export class SbbApiIstDatenMapper {
    static mapCsvToSbbApiIstDatenDto(record: string[]): SbbApiIstDatenDto {
        return {
            betriebstag: record[0],
            fahrt_bezeichner: record[1],
            betreiber_id: record[2],
            betreiber_abk: record[3],
            betreiber_name: record[4],
            produkt_id: record[5],
            linien_id: parseFloat(record[6]),
            linien_text: record[7],
            umlauf_id: record[8],
            verkehrsmittel_text: record[9],
            zusatzfahrt_tf: record[10]?.trim() === 'true',
            faellt_aus_tf: record[11]?.trim() === 'true',
            bpuic: parseFloat(record[12]),
            haltestellen_name: record[13],
            ankunftszeit: DateUtils.getDateTimeFromIstDatenCsvFormat(record[14]),
            an_prognose: DateUtils.getDateTimeFromIstDatenCsvFormat(record[15]),
            an_prognose_status: record[16],
            abfahrtszeit: DateUtils.getDateTimeFromIstDatenCsvFormat(record[17]),
            ab_prognose: DateUtils.getDateTimeFromIstDatenCsvFormat(record[18]),
            ab_prognose_status: record[19],
            durchfahrt_tf: record[20]?.trim() === 'true'
        };
    }
}