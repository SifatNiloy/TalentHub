import { z } from 'zod';

export const locationSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]),
});

export const createJobSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  companyId: z.string().optional(), // ObjectId string
  location: locationSchema,
  skills: z.array(z.string()).optional(),
  salary: z
    .object({
      min: z.number().int().nonnegative().optional(),
      max: z.number().int().nonnegative().optional(),
      currency: z.string().optional(),
    })
    .optional(),
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'internship']).optional(),
  remote: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const updateJobSchema = createJobSchema.partial();

export const getJobsQuerySchema = z.object({
  title: z.string().optional(),
  skill: z.string().optional(),
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'internship']).optional(),
  remote: z.preprocess((v) => {
    if (v === 'true') return true;
    if (v === 'false') return false;
    return v;
  }, z.boolean().optional()),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
  sortBy: z.string().optional(),
  // radius search params
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radiusKm: z.coerce.number().optional(), // in km
});
