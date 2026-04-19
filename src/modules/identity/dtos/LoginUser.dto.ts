import {z} from 'zod';

export const LoginUserSchema = z.object({
    // - Firebase ID token obtained from the client after successful authentication with firebase
    idToken: z.string().min(1, 'ID token is required'),
});


export type LoginUserDto = z.infer<typeof LoginUserSchema>;


