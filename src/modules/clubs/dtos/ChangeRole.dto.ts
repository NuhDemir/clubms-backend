import { z } from 'zod';

export const ChangeRoleSchema = z.object({
    targetUserId: z.string().uuid('Geçersiz kullanıcı ID'),
    newRole: z.enum(['MEMBER', 'VICE_PRESIDENT', 'PRESIDENT'], {
        message: 'Geçersiz rol. Geçerli roller: MEMBER, VICE_PRESIDENT, PRESIDENT'
    })
});

export type ChangeRoleDto = z.infer<typeof ChangeRoleSchema>;
