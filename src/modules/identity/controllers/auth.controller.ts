import { Request, Response, NextFunction } from 'express';
import { RegisterUserSchema } from '../dtos/RegisterUser.dto';
import { container } from '../../../core/container/container';
import { AuthService } from '../services/auth.service';
import { LoginUserSchema } from '../dtos/LoginUser.dto';
import { IUserRepository } from '../interfaces/IUserRepository';
import { AppError } from '../../infrastructure/errors/AppError';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto = RegisterUserSchema.parse(req.body);
    const authService = container.resolve<AuthService>('authService');
    const user = await authService.register(dto);

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        studentNumber: user.studentNumber,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto = LoginUserSchema.parse(req.body);
    const authService = req.container.resolve<AuthService>('authService');
    const user = await authService.login(dto);

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        studentNumber: user.studentNumber,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Kullanıcı bilgisi bulunamadı');
    }

    const userRepository = req.container.resolve<IUserRepository>('userRepository');
    const user = await userRepository.findByFirebaseUid(req.user.uid);

    if (!user) {
      throw AppError.notFound('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        studentNumber: user.studentNumber,
        emailVerified: user.emailVerified,
        status: user.status,
      }
    });
  } catch (error) {
    next(error);
  }
};
