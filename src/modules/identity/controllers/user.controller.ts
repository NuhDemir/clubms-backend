import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';

export const getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userService = req.container.resolve<UserService>('userService');
        const users = await userService.getAllUsers();

        res.status(200).json({
            success: true,
            data: users.map(user => ({
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                studentNumber: user.studentNumber,
                emailVerified: user.emailVerified,
                status: user.status
            }))
        });
    } catch (error) {
        next(error);
    }
};

export const getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = req.params.id as string;
        const userService = req.container.resolve<UserService>('userService');
        const user = await userService.getUserById(id);

        res.status(200).json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                studentNumber: user.studentNumber,
                emailVerified: user.emailVerified,
                status: user.status
            }
        });
    } catch (error) {
        next(error);
    }
};

export const suspendUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = req.params.id as string;
        const userService = req.container.resolve<UserService>('userService');
        const user = await userService.suspendUser(id);

        res.status(200).json({
            success: true,
            message: 'Kullanıcı askıya alındı',
            data: {
                id: user.id,
                status: user.status
            }
        });
    } catch (error) {
        next(error);
    }
};
