import { z } from 'zod';

export const UpdateClubSchema = z.object({
    description: z.string().min(10, 'Açıklama en az 10 karakter olmalı'),
    logoUrl: z.string().url('Geçerli bir URL giriniz').optional()
});

export type UpdateClubDto = z.infer<typeof UpdateClubSchema>;
