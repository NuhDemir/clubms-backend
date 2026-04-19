import { z } from 'zod';

export const UpdateEventSchema = z.object({
    title: z.string().min(3).max(150).optional(),
    description: z.string().min(10).optional(),
    capacity: z.number().int().positive().optional(),
    location: z.string().min(3).max(200).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional()
});

export type UpdateEventDto = z.infer<typeof UpdateEventSchema>;
