import { z } from "zod";

export const sectionFilterZod = z.object({
    from: z.string().or( z.date() ).transform( arg => new Date( arg ) ),
    to: z.string().or( z.date() ).transform( arg => new Date( arg ) ),
    trainType: z.string().optional(),
    trainLine: z.string().optional(),
    trainOperator: z.string().optional(),
    delaysOnly: z.boolean(),
});

export type SectionFilterDto = z.infer<typeof sectionFilterZod>;