import { prop, getModelForClass, modelOptions, index, Severity } from "@typegoose/typegoose";
import {
  USER_ROLES,
  UserRole,
  EXPERIENCE_LEVEL,
  EMPLOYMENT_TYPE_PREFERENCE,
  COMPANY_SIZE,
  USER_STATUSES
} from "../constants/user.constant";

export class SocialLinks {
  @prop({ required: false, type: String, default: null })
  linkedin?: string;

  @prop({ required: false, type: String, default: null })
  github?: string;

  @prop({ required: false, type: String, default: null })
  twitter?: string;

  @prop({ required: false, type: String, default: null })
  portfolio?: string;
}

export class Skills {
  @prop({ required: true, type: String })
  name!: string;

  @prop({ required: false, type: String, default: "intermediate" })
  proficiency?: string;
}

export class Experience {
  @prop({ required: true, type: String })
  jobTitle!: string;

  @prop({ required: true, type: String })
  companyName!: string;

  @prop({ required: false, type: String, default: null })
  location?: string;

  @prop({ required: true, type: Date })
  startDate!: Date;

  @prop({ required: false, type: Date, default: null })
  endDate?: Date;

  @prop({ required: false, type: Boolean, default: false })
  currentlyWorking?: boolean;

  @prop({ required: false, type: String, default: null })
  description?: string;
}

export class Education {
  @prop({ required: true, type: String })
  degree!: string;

  @prop({ required: true, type: String })
  institution!: string;

  @prop({ required: true, type: String })
  fieldOfStudy!: string;

  @prop({ required: true, type: Date })
  startDate!: Date;

  @prop({ required: false, type: Date, default: null })
  endDate?: Date;

  @prop({ required: false, type: Number, default: null })
  gpa?: number;
}

export class CompanyProfile {
  @prop({ required: false, type: String, default: null })
  companyName?: string;

  @prop({ required: false, type: String, default: null })
  description?: string;

  @prop({ required: false, type: String, default: null })
  website?: string;

  @prop({ required: false, type: String, default: null })
  industry?: string;

  @prop({ required: false, type: String, enum: COMPANY_SIZE, default: "1-10" })
  companySize?: string;

  @prop({ required: false, type: String, default: null })
  location?: string;

  @prop({ required: false, type: String, default: null })
  logoUrl?: string;

  @prop({ required: false, type: Date, default: null })
  foundedYear?: Date;
}

export class JobSeekerProfile {
  @prop({ required: false, type: String, default: null })
  resumeUrl?: string;

  @prop({ required: false, type: String, default: null })
  headline?: string;

  @prop({ required: false, type: String, default: null })
  bio?: string;

  @prop({ required: false, type: String, enum: EXPERIENCE_LEVEL, default: "entry" })
  experienceLevel?: string;

  @prop({ required: false, type: Array<string>, default: [] })
  preferredLocations?: string[];

  @prop({ required: false, type: Array<string>, enum: EMPLOYMENT_TYPE_PREFERENCE, default: [] })
  employmentTypePreference?: string[];

  @prop({ required: false, type: Number, default: null })
  expectedSalaryMin?: number;

  @prop({ required: false, type: Number, default: null })
  expectedSalaryMax?: number;

  @prop({ required: false, type: String, default: null })
  salaryType?: string;

  @prop({ required: false, type: Boolean, default: true })
  openToRemote?: boolean;

  @prop({ required: false, type: Boolean, default: false })
  openToRelocation?: boolean;

  @prop({ required: false, type: Array<Skills>, _id: false, default: [], allowMixed: Severity.ALLOW })
  skills?: Skills[];

  @prop({ required: false, type: Array<Experience>, _id: false, default: [], allowMixed: Severity.ALLOW })
  experience?: Experience[];

  @prop({ required: false, type: Array<Education>, _id: false, default: [], allowMixed: Severity.ALLOW })
  education?: Education[];

  @prop({ required: false, type: Array<string>, default: [] })
  certifications?: string[];

  @prop({ required: false, type: Array<string>, default: [] })
  languages?: string[];
}

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "users"
  },
  options: { allowMixed: Severity.ALLOW }
})
@index({ email: 1 }, { unique: true })
@index({ role: 1 })
@index({ status: 1 })
@index({ createdAt: -1 })
export class User {
  @prop({ required: true, type: String })
  name!: string;

  @prop({ required: true, type: String })
  email!: string;

  @prop({ required: true, type: String })
  password!: string;

  @prop({ type: String, enum: USER_ROLES, default: UserRole.JOB_SEEKER })
  role!: UserRole;

  @prop({ type: String, enum: USER_STATUSES, default: "active" })
  status!: string;

  @prop({ required: false, type: String, default: null })
  profileImageUrl?: string;

  @prop({ required: false, type: String, default: null })
  phoneNumber?: string;

  @prop({ required: false, type: String, default: null })
  location?: string;

  @prop({ required: false, type: String, default: null })
  country?: string;

  @prop({ required: false, type: SocialLinks, _id: false, default: {}, allowMixed: Severity.ALLOW })
  socialLinks?: SocialLinks;

  @prop({ required: false, type: JobSeekerProfile, _id: false, default: null, allowMixed: Severity.ALLOW })
  jobSeekerProfile?: JobSeekerProfile;

  @prop({ required: false, type: CompanyProfile, _id: false, default: null, allowMixed: Severity.ALLOW })
  companyProfile?: CompanyProfile;

  @prop({ required: false, type: Date, default: null })
  emailVerifiedAt?: Date;

  @prop({ required: false, type: Boolean, default: false })
  isEmailVerified?: boolean;

  @prop({ required: false, type: Date, default: null })
  lastLoginAt?: Date;

  @prop({ required: false, type: Boolean, default: true })
  isProfileComplete?: boolean;

  @prop({ required: false, type: Number, default: 0 })
  profileViews?: number;
}

export const UserModel = getModelForClass(User);