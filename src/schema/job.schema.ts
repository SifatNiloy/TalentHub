import { object, string, TypeOf, number, boolean, array, date } from "zod";
import {
  EMPLOYMENT_TYPES,
  JOB_STATUSES,
  EXPERIENCE_LEVELS,
  SALARY_TYPES,
  JOB_TITLE_MIN_LENGTH,
  JOB_TITLE_MAX_LENGTH,
  JOB_DESCRIPTION_MIN_LENGTH,
  JOB_DESCRIPTION_MAX_LENGTH,
  COMPANY_NAME_MIN_LENGTH,
  COMPANY_NAME_MAX_LENGTH
} from "../constants/job.constant";

// Salary Range Schema
const salaryRangeSchema = object({
  min: number().positive("Minimum salary must be positive"),
  max: number().positive("Maximum salary must be positive"),
  type: string()
    .refine((val) => !val || SALARY_TYPES.includes(val as any), {
      message: "Invalid salary type"
    })
    .optional(),
  currency: string().optional()
}).refine((data) => data.max >= data.min, {
  message: "Maximum salary must be greater than or equal to minimum salary"
});

// Job Requirements Schema
const jobRequirementsSchema = object({
  skills: array(string()).optional(),
  qualifications: array(string()).optional(),
  responsibilities: array(string()).optional(),
  benefits: array(string()).optional()
});

// Company Info Schema
const companyInfoSchema = object({
  name: string().min(COMPANY_NAME_MIN_LENGTH).max(COMPANY_NAME_MAX_LENGTH),
  website: string().url().optional(),
  logoUrl: string().url().optional(),
  industry: string().optional(),
  companySize: string().optional(),
  description: string().optional()
});

// Create Job Schema
export const createJobSchema = object({
  body: object({
    title: string()
      .min(JOB_TITLE_MIN_LENGTH, `Title must be at least ${JOB_TITLE_MIN_LENGTH} characters`)
      .max(JOB_TITLE_MAX_LENGTH, `Title must not exceed ${JOB_TITLE_MAX_LENGTH} characters`),
    description: string()
      .min(JOB_DESCRIPTION_MIN_LENGTH, `Description must be at least ${JOB_DESCRIPTION_MIN_LENGTH} characters`)
      .max(JOB_DESCRIPTION_MAX_LENGTH, `Description must not exceed ${JOB_DESCRIPTION_MAX_LENGTH} characters`),
    company: companyInfoSchema,
    location: string().min(2, "Location is required"),
    country: string().optional(),
    salaryRange: salaryRangeSchema,
    employmentType: string().refine((val) => EMPLOYMENT_TYPES.includes(val as any), {
      message: "Invalid employment type"
    }),
    experienceLevel: string()
      .refine((val) => !val || EXPERIENCE_LEVELS.includes(val as any), {
        message: "Invalid experience level"
      })
      .optional(),
    remote: boolean().optional(),
    requirements: jobRequirementsSchema.optional(),
    tags: array(string()).optional(),
    expiresAt: string()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Invalid expiration date"
      })
      .optional()
  })
});

// Update Job Schema
export const updateJobSchema = object({
  params: object({
    id: string().min(1, "Job ID is required")
  }),
  body: object({
    title: string()
      .min(JOB_TITLE_MIN_LENGTH)
      .max(JOB_TITLE_MAX_LENGTH)
      .optional(),
    description: string()
      .min(JOB_DESCRIPTION_MIN_LENGTH)
      .max(JOB_DESCRIPTION_MAX_LENGTH)
      .optional(),
    company: companyInfoSchema.optional(),
    location: string().min(2).optional(),
    country: string().optional(),
    salaryRange: salaryRangeSchema.optional(),
    employmentType: string()
      .refine((val) => EMPLOYMENT_TYPES.includes(val as any), {
        message: "Invalid employment type"
      })
      .optional(),
    experienceLevel: string()
      .refine((val) => EXPERIENCE_LEVELS.includes(val as any), {
        message: "Invalid experience level"
      })
      .optional(),
    remote: boolean().optional(),
    status: string()
      .refine((val) => JOB_STATUSES.includes(val as any), {
        message: "Invalid job status"
      })
      .optional(),
    requirements: jobRequirementsSchema.optional(),
    tags: array(string()).optional(),
    expiresAt: string()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Invalid expiration date"
      })
      .optional()
  })
});

// Job ID Schema
export const jobIdSchema = object({
  params: object({
    id: string().min(1, "Job ID is required")
  })
});

// Job Query Schema (for filtering)
export const jobQuerySchema = object({
  query: object({
    page: string()
      .optional()
      .refine((val) => val === undefined || /^[0-9]+$/.test(val), {
        message: "Page must be a positive integer"
      })
      .default("1"),
    limit: string()
      .optional()
      .refine((val) => val === undefined || /^[0-9]+$/.test(val), {
        message: "Limit must be a positive integer"
      })
      .default("10"),
    title: string().optional(),
    location: string().optional(),
    employmentType: string()
      .refine((val) => !val || EMPLOYMENT_TYPES.includes(val as any), {
        message: "Invalid employment type"
      })
      .optional(),
    experienceLevel: string()
      .refine((val) => !val || EXPERIENCE_LEVELS.includes(val as any), {
        message: "Invalid experience level"
      })
      .optional(),
    status: string()
      .refine((val) => !val || JOB_STATUSES.includes(val as any), {
        message: "Invalid status"
      })
      .optional(),
    remote: string()
      .refine((val) => val === undefined || val === "true" || val === "false", {
        message: "Remote must be true or false"
      })
      .optional(),
    minSalary: string()
      .refine((val) => val === undefined || /^[0-9]+$/.test(val), {
        message: "Minimum salary must be a number"
      })
      .optional(),
    maxSalary: string()
      .refine((val) => val === undefined || /^[0-9]+$/.test(val), {
        message: "Maximum salary must be a number"
      })
      .optional(),
    search: string().optional(),
    tags: string().optional() // comma-separated tags
  })
});

// TypeOf exports
export type CreateJobDto = TypeOf<typeof createJobSchema>["body"];
export type UpdateJobDto = TypeOf<typeof updateJobSchema>["body"];
export type JobQueryDto = TypeOf<typeof jobQuerySchema>["query"];
