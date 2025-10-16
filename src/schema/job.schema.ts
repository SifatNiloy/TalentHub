import { z } from "zod";
import { EMPLOYMENT_TYPE } from "../constants/job.constant";
export const createJobSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    company: z.string().min(2),
    location: z.string().min(2),
    salaryRange: z.object({
      min: z.number().positive(),
      max: z.number().positive(),
    }),
    employmentType: z.enum([
      EMPLOYMENT_TYPE.FULL_TIME,
      EMPLOYMENT_TYPE.PART_TIME,
      EMPLOYMENT_TYPE.CONTRACT,
      EMPLOYMENT_TYPE.INTERNSHIP,
      EMPLOYMENT_TYPE.FREELANCE,
    ]),
    remote: z.boolean().optional(),
  }),
});

export const updateJobSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    location: z.string().optional(),
    salaryRange: z
      .object({
        min: z.number().positive(),
        max: z.number().positive(),
      })
      .optional(),
    employmentType: z
      .enum([
        EMPLOYMENT_TYPE.FULL_TIME,
        EMPLOYMENT_TYPE.PART_TIME,
        EMPLOYMENT_TYPE.CONTRACT,
        EMPLOYMENT_TYPE.INTERNSHIP,
        EMPLOYMENT_TYPE.FREELANCE,
      ])
      .optional(),
    remote: z.boolean().optional(),
    status: z.enum(["Active", "Closed", "Draft"]).optional(),
  }),
});

export const jobIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});
