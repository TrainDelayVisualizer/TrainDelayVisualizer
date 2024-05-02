
import { SbbApiHaltestellenDto } from "../model/sbb-api/sbb-api-haltestellen.dto";
import { SbbApiIstDatenDto } from "../model/sbb-api/sbb-api-ist-daten.dto";
import { ApiImportService } from './import.service';

describe('importService', () => {
    describe('groupTrainSectonsByLine', () => {
        it('should group train sections by line', () => {

            const now = new Date();
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
                    ankunftszeit: now,
                    an_prognose: now,
                    an_prognose_status: 'On time',
                    abfahrtszeit: now,
                    ab_prognose: now,
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
                    ankunftszeit: now,
                    an_prognose: now,
                    an_prognose_status: 'On time',
                    abfahrtszeit: now,
                    ab_prognose: now,
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
            expect(result.size).toBe(1);
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
    describe('filterOutRelevantTrainStations', () => {
        it('should filter out relevant train stations', () => {
            // Arrange
            const apiTrainStationDtos: SbbApiHaltestellenDto[] = [
                {
                    bpuic: 5,
                    name: 'Station 1',
                    lat: 47.1234,
                    lon: 8.5678
                },
                {
                    bpuic: 10,
                    name: 'Station 2',
                    lat: 47.4321,
                    lon: 8.8765
                },
                {
                    bpuic: 15,
                    name: 'Station 3',
                    lat: 47.9876,
                    lon: 8.1234
                }
            ];
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
                    ankunftszeit: new Date(),
                    an_prognose: new Date(),
                    an_prognose_status: 'On time',
                    abfahrtszeit: new Date(),
                    ab_prognose: new Date(),
                    ab_prognose_status: 'Delayed',
                    durchfahrt_tf: true
                },
                {
                    betriebstag: '2024-01-01',
                    fahrt_bezeichner: '67890',
                    tdvFahrtBezeichner: '2024-01-01-67890',
                    betreiber_id: '2',
                    betreiber_abk: 'C',
                    betreiber_name: 'Betreiber 2',
                    produkt_id: '3',
                    linien_id: 4,
                    linien_text: 'Line 2',
                    umlauf_id: '5',
                    verkehrsmittel_text: 'Train',
                    zusatzfahrt_tf: false,
                    faellt_aus_tf: true,
                    bpuic: 10,
                    haltestellen_name: 'Station 2',
                    ankunftszeit: new Date(),
                    an_prognose: new Date(),
                    an_prognose_status: 'Delayed',
                    abfahrtszeit: new Date(),
                    ab_prognose: new Date(),
                    ab_prognose_status: 'On time',
                    durchfahrt_tf: false
                },
                {
                    betriebstag: '2024-01-01',
                    fahrt_bezeichner: '24680',
                    tdvFahrtBezeichner: '2024-01-01-24680',
                    betreiber_id: '3',
                    betreiber_abk: 'D',
                    betreiber_name: 'Betreiber 3',
                    produkt_id: '4',
                    linien_id: 5,
                    linien_text: 'Line 3',
                    umlauf_id: '6',
                    verkehrsmittel_text: 'Train',
                    zusatzfahrt_tf: true,
                    faellt_aus_tf: false,
                    bpuic: 15,
                    haltestellen_name: 'Station 3',
                    ankunftszeit: new Date(),
                    an_prognose: new Date(),
                    an_prognose_status: 'On time',
                    abfahrtszeit: new Date(),
                    ab_prognose: new Date(),
                    ab_prognose_status: 'Delayed',
                    durchfahrt_tf: true
                }
            ];
            const expectedRelevantTrainStations: SbbApiHaltestellenDto[] = [
                {
                    bpuic: 5,
                    name: 'Station 1',
                    lat: 47.1234,
                    lon: 8.5678
                },
                {
                    bpuic: 10,
                    name: 'Station 2',
                    lat: 47.4321,
                    lon: 8.8765
                },
                {
                    bpuic: 15,
                    name: 'Station 3',
                    lat: 47.9876,
                    lon: 8.1234
                }
            ];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const importService = new ApiImportService(undefined as any, undefined as any);

            // Act
            const result = importService.filterOutRelevantTrainStations(apiTrainStationDtos, sbbTrainConnectionDtos);

            // Assert
            expect(result).toEqual(expectedRelevantTrainStations);
        });
    });
});