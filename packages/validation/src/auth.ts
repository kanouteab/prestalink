import { z } from 'zod';

/**
 * Doit rester alignee avec `AccountRecoveryService.isStrongPassword` cote
 * backend (src/main/java/.../recovery/AccountRecoveryService.java) : 8+
 * caracteres, une majuscule, une minuscule, un chiffre.
 */
export const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caracteres')
  .refine((value) => /[A-Z]/.test(value), 'Le mot de passe doit contenir une majuscule')
  .refine((value) => /[a-z]/.test(value), 'Le mot de passe doit contenir une minuscule')
  .refine((value) => /[0-9]/.test(value), 'Le mot de passe doit contenir un chiffre');

export const loginSchema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Le nom complet est requis'),
    email: z.string().email('Adresse e-mail invalide'),
    phone: z.string().min(8, 'Numero de telephone invalide'),
    password: passwordSchema,
    confirmPassword: z.string(),
    country: z.string().min(1, 'Le pays est requis'),
    streetAddress: z.string().min(1, "L'adresse est requise"),
    postalCode: z.string().min(1, 'Le code postal est requis'),
    role: z.enum(['CLIENT', 'PRESTATAIRE']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
