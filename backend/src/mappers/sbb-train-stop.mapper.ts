import { TrainStation } from "@prisma/client";
import { SbbTrainStopDto } from "../model/sbb-api/sbb-train-stop.dto";
import { NumberUtils } from "../utils/number.utils";

export class SbbTrainStopDtoMapper {

    static mapValidTrainStations(distictedTrainStops: SbbTrainStopDto[]): TrainStation[] {
        return distictedTrainStops.map(sbbTrainStop => {
            if (this.sbbTrainStopDtoIsValid(sbbTrainStop)) {
                return this.mapTrainStation(sbbTrainStop);
            }
        }).filter(x => !!x) as TrainStation[];
    }

    static mapTrainStation(sbbTrainStop: SbbTrainStopDto): TrainStation {
        return {
            id: sbbTrainStop.bpuic,
            description: sbbTrainStop.haltestellen_name,
            lon: NumberUtils.roundByDecimals(sbbTrainStop.geopos.lon, 14),
            lat: NumberUtils.roundByDecimals(sbbTrainStop.geopos.lat, 14)
        };
    }

    static sbbTrainStopDtoIsValid(sbbTrainStop: SbbTrainStopDto) {
        return !([
            sbbTrainStop.bpuic,
            sbbTrainStop.haltestellen_name,
            sbbTrainStop.geopos,
            sbbTrainStop.geopos?.lon,
            sbbTrainStop.geopos?.lat
        ].some(x => !x));
    }
}