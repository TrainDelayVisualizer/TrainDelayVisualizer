import { SbbApiIstDatenDto } from "../model/sbb-api/sbb-api-ist-daten.dto";
import { SbbApiIstDatenMapper } from "./sbb-api-ist-daten.mapper";

it('should map CSV record to SbbApiIstDatenDto', () => {
    const record: string[] = [
        '2024-01-01',
        '12345',
        '1',
        'B',
        'Betreiber 1',
        '2',
        '3',
        'Line 1',
        '4',
        'Train',
        'true',
        'false',
        '5',
        'Station 1',
        '01.01.2024 10:00',
        '01.01.2024 12:00:05',
        'On time',
        '01.01.2024 10:00',
        '01.01.2024 12:00:05',
        'Delayed',
        'true'
    ];

    const expectedDto: SbbApiIstDatenDto = {
        betriebstag: '2024-01-01',
        fahrt_bezeichner: '12345',
        betreiber_id: '1',
        betreiber_abk: 'B',
        betreiber_name: 'Betreiber 1',
        produkt_id: '2',
        linien_id: 3,
        linien_text: 'Line 1',
        umlauf_id: '4',
        verkehrsmittel_text: 'Train',
        zusatzfahrt_tf: true,
        faellt_aus_tf: false,
        bpuic: 5,
        haltestellen_name: 'Station 1',
        ankunftszeit: new Date('2024-01-01T09:00:00Z'),
        an_prognose: new Date('2024-01-01T11:00:00Z'),
        an_prognose_status: 'On time',
        abfahrtszeit: new Date('2024-01-01T09:00:00Z'),
        ab_prognose: new Date('2024-01-01T11:00:00Z'),
        ab_prognose_status: 'Delayed',
        durchfahrt_tf: true
    };

    const result = SbbApiIstDatenMapper.mapCsvToSbbApiIstDatenDto(record);
    expect(result).toEqual(expectedDto);
});