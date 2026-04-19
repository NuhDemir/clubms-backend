import { Request, Response, NextFunction } from 'express';
import { RoleService } from '../services/role.service';
import { z } from 'zod';

const AssignGlobalRoleSchema = z.object({
    userId: z.string().uuid('Geçersiz kullanıcı ID'),
    roleName: z.enum(['SUPER_ADMIN', 'SKS_MANAGER', 'USER'], {
        message: 'Geçersiz rol. Geçerli roller: SUPER_ADMIN, SKS_MANAGER, USER'
    })
});

export const assignGlobalRole = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const dto = AssignGlobalRoleSchema.parse(req.body);
        const roleService = req.container.resolve<RoleService>('roleService');

        await roleService.assignGlobalRole(dto);

        res.status(200).json({
            success: true,
            message: 'Global rol başarıyla atandı'
        });
    } catch (error) {
        next(error);
    }
};

export const getGlobalRole = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.params.userId as string;
        const roleService = req.container.resolve<RoleService>('roleService');

        const role = await roleService.getGlobalRole(userId);

        res.status(200).json({
            success: true,
            data: { userId, roleName: role }
        });
    } catch (error) {
        next(error);
    }
};
