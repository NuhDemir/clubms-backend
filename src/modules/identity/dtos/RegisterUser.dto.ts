import { z } from 'zod';

export const RegisterUserSchema = z.object({
  email: z.string().email().endsWith('@bartin.edu.tr'),
  fullName: z.string().min(2).max(100),
  studentNumber: z.string().length(9),
  password: z.string().min(6).max(100),
});

export type RegisterUserDto = z.infer<typeof RegisterUserSchema>;