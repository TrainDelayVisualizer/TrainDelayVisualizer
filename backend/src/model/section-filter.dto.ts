import { z } from "zod";

export const sectionFilterZod = z.object({
    from: z.date(),
    to: z.date(),
    trainType: z.string().optional(),
    trainLine: z.string().optional(),
    delaysOnly: z.boolean(),
});

export type SectionFilterDto = z.infer<typeof sectionFilterZod>;