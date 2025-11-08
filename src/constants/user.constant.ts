export enum UserRole {
  ADMIN = "admin",
  EMPLOYER = "employer",
  JOB_SEEKER = "job_seeker", // Changed from "jobseeker" to "job_seeker" for consistency
  USER = "user"
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING = "pending"
}

// Experience Level
export enum ExperienceLevel {
  ENTRY = "entry",
  INTERMEDIATE = "intermediate",
  SENIOR = "senior",
  LEAD = "lead",
  EXECUTIVE = "executive"
}

// Employment Type Preference
export enum EmploymentTypePreference {
  FULL_TIME = "full_time",
  PART_TIME = "part_time",
  CONTRACT = "contract",
  FREELANCE = "freelance",
  INTERNSHIP = "internship"
}

// Company Size
export enum CompanySize {
  STARTUP = "1-10",
  SMALL = "11-50",
  MEDIUM = "51-200",
  LARGE = "201-1000",
  ENTERPRISE = "1000+"
}

export const USER_ROLES = Object.values(UserRole);
export const USER_STATUSES = Object.values(UserStatus);
export const EXPERIENCE_LEVEL = Object.values(ExperienceLevel);
export const EMPLOYMENT_TYPE_PREFERENCE = Object.values(EmploymentTypePreference);
export const COMPANY_SIZE = Object.values(CompanySize);

// Also export as object for easier reference
export const USER_STATUS = UserStatus;

// Validation constants
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 100;

// JWT constants
export const JWT_EXPIRES_IN = "7d";
export const REFRESH_TOKEN_EXPIRES_IN = "30d";

// File upload constants
export const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
export const MAX_RESUME_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];