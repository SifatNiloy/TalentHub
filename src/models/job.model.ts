import { prop, getModelForClass, modelOptions, index, Ref } from "@typegoose/typegoose";
import {
  EMPLOYMENT_TYPES,
  JOB_STATUSES,
  EXPERIENCE_LEVELS,
  SALARY_TYPES,
  EmploymentType,
  JobStatus
} from "../constants/job.constant";
import { User } from "./user.model";

export class SalaryRange {
  @prop({ required: true, type: Number })
  min!: number;

  @prop({ required: true, type: Number })
  max!: number;

  @prop({ required: false, type: String, enum: SALARY_TYPES, default: "yearly" })
  type?: string;

  @prop({ required: false, type: String, default: "USD" })
  currency?: string;
}

export class JobRequirements {
  @prop({ required: false, type: Array<String>, default: [] })
  skills?: string[];

  @prop({ required: false, type: Array<String>, default: [] })
  qualifications?: string[];

  @prop({ required: false, type: Array<String>, default: [] })
  responsibilities?: string[];

  @prop({ required: false, type: Array<String>, default: [] })
  benefits?: string[];
}

export class CompanyInfo {
  @prop({ required: true, type: String })
  name!: string;

  @prop({ required: false, type: String, default: null })
  website?: string;

  @prop({ required: false, type: String, default: null })
  logoUrl?: string;

  @prop({ required: false, type: String, default: null })
  industry?: string;

  @prop({ required: false, type: String, default: null })
  companySize?: string;

  @prop({ required: false, type: String, default: null })
  description?: string;
}

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "jobs"
  }
})
@index({ status: 1, createdAt: -1 })
@index({ postedBy: 1, createdAt: -1 })
@index({ location: 1, status: 1 })
export class Job {
  @prop({ required: true, type: String })
  title!: string;

  @prop({ required: true, type: String })
  description!: string;

  @prop({ required: true, type: CompanyInfo })
  company!: CompanyInfo;

  @prop({ required: true, type: String })
  location!: string;

  @prop({ required: false, type: String, default: null })
  country?: string;

  @prop({ required: true, type: SalaryRange })
  salaryRange!: SalaryRange;

  @prop({ required: true, type: String, enum: EMPLOYMENT_TYPES })
  employmentType!: EmploymentType;

  @prop({ required: false, type: String, enum: EXPERIENCE_LEVELS, default: "entry" })
  experienceLevel?: string;

  @prop({ required: false, type: Boolean, default: false })
  remote?: boolean;

  @prop({ required: false, type: String, enum: JOB_STATUSES, default: "active" })
  status?: JobStatus;

  @prop({ required: true, ref: () => User })
  postedBy!: Ref<User>;

  @prop({ required: false, type: JobRequirements, default: {} })
  requirements?: JobRequirements;

  @prop({ required: false, type: Array<String>, default: [] })
  tags?: string[];

  @prop({ required: false, type: Number, default: 0 })
  views?: number;

  @prop({ required: false, type: Number, default: 0 })
  applicationsCount?: number;

  @prop({ required: false, type: Date, default: null })
  expiresAt?: Date;

  @prop({ required: false, type: Boolean, default: true })
  isActive?: boolean;

  @prop({ required: false, type: Date, default: null })
  publishedAt?: Date;
}

export const JobModel = getModelForClass(Job);index({ createdAt: -1 })
@index({ expiresAt: 1 })
export class Job {
  @prop({ required: true, type: String })
  title!: string;

  @prop({ required: true, type: String })
  description!: string;

  @prop({ required: true, type: CompanyInfo })
  company!: CompanyInfo;

  @prop({ required: true, type: String })
  location!: string;

  @prop({ required: false, type: String, default: null })
  country?: string;

  @prop({ required: true, type: SalaryRange })
  salaryRange!: SalaryRange;

  @prop({ required: true, type: String, enum: EMPLOYMENT_TYPES })
  employmentType!: EmploymentType;

  @prop({ required: false, type: String, enum: EXPERIENCE_LEVELS, default: "entry" })
  experienceLevel?: string;

  @prop({ required: false, type: Boolean, default: false })
  remote?: boolean;

  @prop({ required: false, type: String, enum: JOB_STATUSES, default: "active" })
  status?: JobStatus;

  @prop({ required: true, ref: () => User })
  postedBy!: Ref<User>;

  @prop({ required: false, type: JobRequirements, default: {} })
  requirements?: JobRequirements;

  @prop({ required: false, type: Array<String>, default: [] })
  tags?: string[];

  @prop({ required: false, type: Number, default: 0 })
  views?: number;

  @prop({ required: false, type: Number, default: 0 })
  applicationsCount?: number;

  @prop({ required: false, type: Date, default: null })
  expiresAt?: Date;

  @prop({ required: false, type: Boolean, default: true })
  isActive?: boolean;

  @prop({ required: false, type: Date, default: null })
  publishedAt?: Date;
}

export const JobModel = getModelForClass(Job);