import {z, object, string, coerce } from "zod"; // Added 'coerce'
import { APPLICATION_STATUSES } from "../models/application.model";

// Schema for POST /create (Applying to a job)
export const createApplicationSchema = object({
  body: object({
    jobId: string().min(1),
    applicantId: string().min(1),
    coverLetter: string().optional(),
    resumeUrl: z.url().optional(),
  }),
});

// Schema for PUT /update/:id (Updating applicant-provided fields)
export const updateApplicationSchema = object({
  params: object({
    id: string().min(1), 
  }),
  body: object({
    coverLetter: string().optional(),
    resumeUrl: z.url().optional(),
    notes: string().optional(),
  }),
});

// Schema for PATCH /update-status/:id (Updating status by admin/employer)
export const updateStatusSchema = object({
  params: object({
    id: string().min(1),
  }),
  body: object({
    status: z.enum(Object.values(APPLICATION_STATUSES)),
    notes: string().optional(),
  }),
});

// Schema for GET /all (Listing applications)
export const getApplicationsQuerySchema = object({
  query: object({ // Validation for the query parameters (req.query)
    jobId: string().optional(),
    applicantId: string().optional(),
    status: z.enum(Object.values(APPLICATION_STATUSES)).optional(),
    page: coerce.number().int().positive().optional().default(1),
    limit: coerce.number().int().positive().optional().default(10),
  }),
});

// Schema for GET /:id, POST /withdraw/:id, DELETE /delete/:id
export const applicationIdSchema = object({
  params: object({ // Validation for the ':id' parameter in the URL
    id: string().min(1),
  }),
});