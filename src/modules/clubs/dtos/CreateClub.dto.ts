import { z } from 'zod';

export const CreateClubSchema = z.object({
    name: z.string().min(3, 'Kulüp adı en az 3 karakter olmalı').max(100, 'Kulüp adı en fazla 100 karakter olabilir'),
    description: z.string().min(10, 'Açıklama en az 10 karakter olmalı'),
    logoUrl: z.string().url('Geçerli bir URL giriniz').optional(),
    presidentUserId: z.string().uuid('Geçersiz kullanıcı ID')
});

export type CreateClubDto = z.infer<typeof CreateClubSchema>;
