import { z } from 'zod';

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Le nom complet est requis'),
  phone: z.string().min(8, 'Numero de telephone invalide'),
  role: z.enum(['CLIENT', 'PRESTATAIRE']),
  country: z.string().min(1, 'Le pays est requis'),
  city: z.string().optional(),
  streetAddress: z.string().min(1, "L'adresse est requise"),
  postalCode: z.string().min(1, 'Le code postal est requis'),
});
export type ProfileFormValues = z.infer<typeof profileSchema>;
