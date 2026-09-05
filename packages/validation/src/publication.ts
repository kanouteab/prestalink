import { z } from 'zod';

export type PublicationKind = 'OFFER' | 'REQUEST';

const publicationBaseShape = {
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caracteres').max(120),
  description: z.string().min(10, 'Decrivez le service en au moins 10 caracteres').max(2000),
  categoryId: z.number({ message: 'Choisissez une categorie' }).int().positive(),
  location: z.string().min(1, 'La localisation est requise'),
  locationLabel: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
};

const offerSchema = z.object({
  ...publicationBaseShape,
  kind: z.literal('OFFER'),
  price: z.number({ message: 'Indiquez un prix' }).positive('Le prix doit etre superieur a 0'),
});

const requestSchema = z.object({
  ...publicationBaseShape,
  kind: z.literal('REQUEST'),
  budget: z.number({ message: 'Indiquez un budget' }).positive('Le budget doit etre superieur a 0'),
});

/**
 * Un seul moteur de formulaire pour creation/edition/conversion d'Offre et de
 * Demande (livrable 8) : le champ Prix ou Budget apparait selon `kind`, le
 * reste du schema est partage.
 */
export function publicationSchema(kind: PublicationKind) {
  return kind === 'OFFER' ? offerSchema : requestSchema;
}

export type OfferFormValues = z.infer<typeof offerSchema>;
export type RequestFormValues = z.infer<typeof requestSchema>;
export type PublicationFormValues = OfferFormValues | RequestFormValues;
