import { object, string, TypeOf, array, number, boolean, date } from "zod";
import { USER_ROLES, EXPERIENCE_LEVEL, EMPLOYMENT_TYPE_PREFERENCE, COMPANY_SIZE, USER_STATUS } from "../constants/user.constants";

// Social Links Schema
const socialLinksSchema = object({
  linkedin: string().url().optional(),
  github: string().url().optional(),
  twitter: string().url().optional(),
  portfolio: string().url().optional()
});

// Skills Schema
const skillsSchema = object({
  name: string().min(1, "Skill name is required"),
  proficiency: string().optional()
});

// Experience Schema
const experienceSchema = object({
  jobTitle: string().min(1, "Job title is required"),
  companyName: string().min(1, "Company name is required"),
  location: string().optional(),
  startDate: string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date"
  }),
  endDate: string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid end date"
    })
    .optional(),
  currentlyWorking: boolean().optional(),
  description: string().optional()
});

// Education Schema
const educationSchema = object({
  degree: string().min(1, "Degree is required"),
  institution: string().min(1, "Institution is required"),
  fieldOfStudy: string().min(1, "Field of study is required"),
  startDate: string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date"
  }),
  endDate: string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid end date"
    })
    .optional(),
  gpa: number().min(0).max(4).optional()
});

// Company Profile Schema
const companyProfileSchema = object({
  companyName: string().optional(),
  description: string().optional(),
  website: string().url().optional(),
  industry: string().optional(),
  companySize: string()
    .refine((val) => !val || Object.values(COMPANY_SIZE).includes(val as any), {
      message: "Invalid company size"
    })
    .optional(),
  location: string().optional(),
  logoUrl: string().url().optional(),
  foundedYear: string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid founded year"
    })
    .optional()
});

// Job Seeker Profile Schema
const jobSeekerProfileSchema = object({
  resumeUrl: string().url().optional(),
  headline: string().optional(),
  bio: string().optional(),
  experienceLevel: string()
    .refine((val) => !val || Object.values(EXPERIENCE_LEVEL).includes(val as any), {
      message: "Invalid experience level"
    })
    .optional(),
  preferredLocations: array(string()).optional(),
  employmentTypePreference: array(string()).optional(),
  expectedSalaryMin: number().positive().optional(),
  expectedSalaryMax: number().positive().optional(),
  salaryType: string().optional(),
  openToRemote: boolean().optional(),
  openToRelocation: boolean().optional(),
  skills: array(skillsSchema).optional(),
  experience: array(experienceSchema).optional(),
  education: array(educationSchema).optional(),
  certifications: array(string()).optional(),
  languages: array(string()).optional()
});

// Create User Schema
export const createUserSchema = object({
  body: object({
    name: string().min(1, "Name is required"),
    email: string().email("Invalid email address"),
    password: string().min(6, "Password must be at least 6 characters"),
    role: string().refine((val) => USER_ROLES.includes(val as any), {
      message: "Role must be either 'job_seeker' or 'employer'"
    }),
    phoneNumber: string().optional(),
    location: string().optional(),
    country: string().optional()
  })
});

// Update User Schema
export const updateUserSchema = object({
  body: object({
    name: string().min(1).optional(),
    email: string().email("Invalid email address").optional(),
    phoneNumber: string().optional(),
    location: string().optional(),
    country: string().optional(),
    profileImageUrl: string().url().optional(),
    socialLinks: socialLinksSchema.optional(),
    jobSeekerProfile: jobSeekerProfileSchema.optional(),
    companyProfile: companyProfileSchema.optional(),
    status: string()
      .refine((val) => !val || Object.values(USER_STATUS).includes(val as any), {
        message: "Invalid status"
      })
      .optional()
  })
});

// Update Profile Schema (separate from general update)
export const updateProfileSchema = object({
  body: object({
    name: string().min(1).optional(),
    phoneNumber: string().optional(),
    location: string().optional(),
    country: string().optional(),
    profileImageUrl: string().url().optional(),
    socialLinks: socialLinksSchema.optional()
  })
});

// Update Job Seeker Profile Schema
export const updateJobSeekerProfileSchema = object({
  body: jobSeekerProfileSchema
});

// Update Company Profile Schema
export const updateCompanyProfileSchema = object({
  body: companyProfileSchema
});

// Pagination Query Schema
export const paginationQuerySchema = object({
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
    role: string()
      .optional()
      .refine((val) => !val || USER_ROLES.includes(val as any), {
        message: "Invalid role filter"
      }),
    status: string()
      .optional()
      .refine((val) => !val || Object.values(USER_STATUS).includes(val as any), {
        message: "Invalid status filter"
      }),
    search: string().optional()
  })
});

// Change Password Schema
export const changePasswordSchema = object({
  body: object({
    currentPassword: string().min(1, "Current password is required"),
    newPassword: string().min(6, "New password must be at least 6 characters")
  })
});

// TypeOf exports
export type CreateUserDto = TypeOf<typeof createUserSchema>["body"];
export type UpdateUserDto = TypeOf<typeof updateUserSchema>["body"];
export type UpdateProfileDto = TypeOf<typeof updateProfileSchema>["body"];
export type UpdateJobSeekerProfileDto = TypeOf<typeof updateJobSeekerProfileSchema>["body"];
export type UpdateCompanyProfileDto = TypeOf<typeof updateCompanyProfileSchema>["body"];
export type PaginationQueryDto = TypeOf<typeof paginationQuerySchema>["query"];
export type ChangePasswordDto = TypeOf<typeof changePasswordSchema>["body"];