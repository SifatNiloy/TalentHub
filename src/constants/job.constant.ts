export enum EmploymentType {
  FULL_TIME = "full_time",
  PART_TIME = "part_time",
  CONTRACT = "contract",
  INTERNSHIP = "internship",
  FREELANCE = "freelance",
  TEMPORARY = "temporary"
}

export enum JobStatus {
  ACTIVE = "active",
  CLOSED = "closed",
  DRAFT = "draft",
  EXPIRED = "expired",
  PENDING = "pending"
}

export enum ExperienceLevel {
  ENTRY = "entry",
  INTERMEDIATE = "intermediate",
  SENIOR = "senior",
  LEAD = "lead",
  EXECUTIVE = "executive"
}

export enum SalaryType {
  HOURLY = "hourly",
  MONTHLY = "monthly",
  YEARLY = "yearly"
}

export enum ApplicationStatus {
  PENDING = "pending",
  REVIEWING = "reviewing",
  SHORTLISTED = "shortlisted",
  INTERVIEWED = "interviewed",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  WITHDRAWN = "withdrawn"
}

export const EMPLOYMENT_TYPES = Object.values(EmploymentType);
export const JOB_STATUSES = Object.values(JobStatus);
export const EXPERIENCE_LEVELS = Object.values(ExperienceLevel);
export const SALARY_TYPES = Object.values(SalaryType);
export const APPLICATION_STATUSES = Object.values(ApplicationStatus);

// Validation constants
export const JOB_TITLE_MIN_LENGTH = 3;
export const JOB_TITLE_MAX_LENGTH = 200;
export const JOB_DESCRIPTION_MIN_LENGTH = 50;
export const JOB_DESCRIPTION_MAX_LENGTH = 10000;
export const COMPANY_NAME_MIN_LENGTH = 2;
export const COMPANY_NAME_MAX_LENGTH = 200;

// Pagination defaults
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;