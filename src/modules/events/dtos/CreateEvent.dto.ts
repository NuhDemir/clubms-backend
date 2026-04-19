import { z } from 'zod';

export const CreateEventSchema = z.object({
    clubId: z.string().uuid('Geçersiz kulüp ID'),
    title: z.string().min(3, 'Başlık en az 3 karakter olmalı').max(150, 'Başlık en fazla 150 karakter olabilir'),
    description: z.string().min(10, 'Açıklama en az 10 karakter olmalı'),
    capacity: z.number().int().positive('Kapasite pozitif bir sayı olmalı'),
    location: z.string().min(3, 'Konum en az 3 karakter olmalı').max(200, 'Konum en fazla 200 karakter olabilir'),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    startTime: z.string().datetime('Geçerli bir tarih giriniz'),
    endTime: z.string().datetime('Geçerli bir tarih giriniz')
}).refine(
    (data) => new Date(data.endTime) > new Date(data.startTime),
    {
        message: 'Bitiş tarihi başlangıç tarihinden sonra olmalı',
        path: ['endTime']
    }
);

export type CreateEventDto = z.infer<typeof CreateEventSchema>;
