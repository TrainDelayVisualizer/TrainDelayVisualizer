import { z } from "zod";

export const ridesByStationQueryZod = z.object({
    date: z.string().or(z.date()).transform(arg => new Date(arg)),
    page: z.string().nullish().transform(arg => parseInt(arg || '0'))
});

export type RidesByStationQueryDto = z.infer<typeof ridesByStationQueryZod>;