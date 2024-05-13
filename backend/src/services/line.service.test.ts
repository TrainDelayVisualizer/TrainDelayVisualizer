import { assert } from "console";
import { LineService } from "./line.service";
import { DataAccessClient } from "../database/data-access.client";
import { Line } from "@prisma/client";



describe(LineService.name, () => {
    it('should return a list of lines', async () => {
        const dataAccess = new DataAccessClient();
        const lineService = new LineService(dataAccess);

        const linesInDb: Line[] = [
            {
                name: 'Line 1',
                trainType: 'express',
                // trainRides: [
                //     {
                //         id: '1',
                //         plannedStart: new Date('2024-01-01'),
                //         plannedEnd: new Date('2024-01-02'),
                //         lineName: 'Line 1',
                //         name: 'Ride 1',
                //         stationStartId: 1,
                //         stationEndId: 2,
                //         sections: [
                //             {
                //                 plannedDeparture: new Date('2024-01-01'),
                //                 stationFromId: 0,
                //                 stationToId: 0,
                //                 actualDeparture: new Date('2024-01-01'),
                //                 plannedArrival: new Date('2024-01-01'),
                //                 actualArrival: new Date('2024-01-01'),
                //                 isDelay: false,
                //                 isCancelled: false,
                //                 trainRideId: '0'
                //             },
                //             {
                //                 plannedDeparture: new Date('2024-01-02'),
                //                 stationFromId: 0,
                //                 stationToId: 0,
                //                 actualDeparture: new Date('2024-01-02'),
                //                 plannedArrival: new Date('2024-01-02'),
                //                 actualArrival: new Date('2024-01-02'),
                //                 isDelay: false,
                //                 isCancelled: false,
                //                 trainRideId: '0'
                //             }
                //         ]
                //     },
                // ]
            },
        ];

        lineService['dataAccess'].client.line.findMany = jest.fn().mockResolvedValue(linesInDb);

        const lines = await lineService.getLines();

        assert(lines.length === 1);
        assert(lines[0] == linesInDb[0])
    });
});
