
import { SbbApiIstDatenDto } from "../model/sbb-api/sbb-api-ist-daten.dto";
import { ApiImportService } from './import.service';

describe('importService', () => {
    describe('groupTrainSectonsByLine', () => {
        it('should group train sections by line', () => {
            // Arrange
            const sbbTrainConnectionDtos: SbbApiIstDatenDto[] = [
                {
                    betriebstag: '2024-01-01',
                    fahrt_bezeichner: '12345',
                    tdvFahrtBezeichner: '2024-01-01-12345',
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
                },
                {
                    betriebstag: '2024-01-01',
                    fahrt_bezeichner: '12345',
                    tdvFahrtBezeichner: '2024-01-01-12345',
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
                },
                {
                    betriebstag: '2024-01-01',
                    fahrt_bezeichner: '12345',
                    tdvFahrtBezeichner: '2024-01-01-12345',
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
                }
            ];
            const existingTrainStationBpuics: number[] = [
                5
            ];

            // Act
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = new ApiImportService(undefined as any, undefined as any).groupTrainSectonsByLine(sbbTrainConnectionDtos, existingTrainStationBpuics);

            // Assert
            expect(result).toBeDefined();
            expect(result.size).toBe(0); // because date is in past
            for (const [key, value] of result) {
                expect(key).toBeDefined();
                expect(value).toBeDefined();
                expect(value.length).toBeGreaterThan(0);
                /*for (const trainSection of value) {
                    expect(trainSection).toBeInstanceOf(TrainSectionDto);
                }*/
            }
        });
    });
});