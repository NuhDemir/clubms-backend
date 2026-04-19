import { z } from 'zod';

export const CheckInQRSchema = z.object({
    qrCode: z.string().min(1, 'QR kod gerekli')
});

export type CheckInQRDto = z.infer<typeof CheckInQRSchema>;
