import { z } from "zod";
import { APPLICATION_STATUSES } from "../models/application.model";

export const createApplicationSchema = z.object({
  jobId: z.string().min(1),
  applicantId: z.string().min(1),
  coverLetter: z.string().optional(),
  resumeUrl: z.string().url().optional(),
});

export const updateApplicationSchema = z.object({
  coverLetter: z.string().optional(),
  resumeUrl: z.string().url().optional(),
  notes: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum([...APPLICATION_STATUSES] as [string, ...string[]]),
  notes: z.string().optional(),
});

export const getApplicationsQuerySchema = z.object({
  jobId: z.string().optional(),
  applicantId: z.string().optional(),
  status: z.enum([...APPLICATION_STATUSES] as [string, ...string[]]).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
});

export const applicationIdSchema = z.object({
  id: z.string().min(1),
});
