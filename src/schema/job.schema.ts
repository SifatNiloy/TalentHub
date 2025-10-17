import {z, number, object, string, boolean , array } from "zod";
import { EMPLOYMENT_TYPE, JOB_STATUS } from "../constants/job.constant";

export const createJobSchema = object({
  body: array(
    object({
      title: string().min(3),
      description: string().min(10),
      company: string().min(2),
      location: string().min(2),
      salaryRange: object({
        min: number().positive(),
        max: number().positive(),
      }),
      employmentType: z.enum(Object.values(EMPLOYMENT_TYPE)),
      remote: boolean().optional(),
    })
  ),
});

export const updateJobSchema =  object({
  body:  object({
    title:  string().min(3).optional(),
    description:  string().min(10).optional(),
    location:  string().optional(),
    salaryRange: object({
        min:  number().positive(),
        max:  number().positive(),
      })
      .optional(),
    employmentType:  z.enum(Object.values(EMPLOYMENT_TYPE)).optional(),
    remote:  boolean().optional(),
    status: z.enum(Object.values(JOB_STATUS)).optional(),  
  }),
});

export const jobIdSchema =  object({
  params:  object({
    id:  string().min(1),
  }),
});
