export const USER_ROLES = ["job_seeker", "employer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export enum USER_STATUS {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING_VERIFICATION = "pending_verification"
}

export enum EXPERIENCE_LEVEL {
  ENTRY = "entry",
  INTERMEDIATE = "intermediate",
  SENIOR = "senior",
  EXPERT = "expert"
}

export enum EMPLOYMENT_TYPE_PREFERENCE {
  FULL_TIME = "full_time",
  PART_TIME = "part_time",
  CONTRACT = "contract",
  FREELANCE = "freelance",
  INTERNSHIP = "internship"
}

export enum COMPANY_SIZE {
  STARTUP = "1-10",
  SMALL = "11-50",
  MEDIUM = "51-200",
  LARGE = "201-1000",
  ENTERPRISE = "1000+"
}

export const allowedResumeFileTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

export const allowedProfileImageTypes = ["image/jpeg", "image/png", "image/jpg"];

export const allowedCompanyLogoTypes = ["image/jpeg", "image/png", "image/jpg", "image/svg+xml"];