import { z } from 'zod';

export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'La note minimale est 1').max(5, 'La note maximale est 5'),
  comment: z.string().max(1000).optional(),
});
export type ReviewFormValues = z.infer<typeof reviewSchema>;
