import { z } from "zod";

export const lineStatisticFilterZod = z.object({
    from: z.string().or( z.date() ).transform( arg => new Date( arg ) ),
    to: z.string().or( z.date() ).transform( arg => new Date( arg ) ),
    lineName: z.string().optional(),
});

export type LineStatisticFilterDto = z.infer<typeof lineStatisticFilterZod>;