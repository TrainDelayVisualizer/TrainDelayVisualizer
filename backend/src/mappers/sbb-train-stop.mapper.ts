import { TrainStation } from "@prisma/client";
import { NumberUtils } from "../utils/number.utils";
import { SbbApiHaltestellenDto } from "../model/sbb-api/sbb-api-haltestellen.dto";

export class SbbTrainStopDtoMapper {

    static mapValidTrainStations(distictedTrainStops: SbbApiHaltestellenDto[]): TrainStation[] {
        return distictedTrainStops.map(sbbTrainStop => {
            if (this.sbbTrainStopDtoIsValid(sbbTrainStop)) {
                return this.mapTrainStation(sbbTrainStop);
            }
        }).filter(x => !!x) as TrainStation[];
    }

    static mapTrainStation(sbbTrainStop: SbbApiHaltestellenDto): TrainStation {
        return {
            id: sbbTrainStop.bpuic,
            description: sbbTrainStop.name,
            lon: NumberUtils.roundByDecimals(sbbTrainStop.lon, 14),
            lat: NumberUtils.roundByDecimals(sbbTrainStop.lat, 14)
        };
    }

    static sbbTrainStopDtoIsValid(sbbTrainStop: SbbApiHaltestellenDto) {
        return !([
            sbbTrainStop.bpuic,
            sbbTrainStop.name,
            sbbTrainStop.lat,
            sbbTrainStop.lon,
        ].some(x => !x));
    }
}