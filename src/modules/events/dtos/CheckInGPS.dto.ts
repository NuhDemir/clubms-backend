import { z } from 'zod';

export const CheckInGPSSchema = z.object({
    latitude: z.number().min(-90).max(90, 'Geçersiz enlem'),
    longitude: z.number().min(-180).max(180, 'Geçersiz boylam')
});

export type CheckInGPSDto = z.infer<typeof CheckInGPSSchema>;
