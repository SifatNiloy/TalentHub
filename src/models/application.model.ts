import { prop, getModelForClass, modelOptions, index, Ref } from "@typegoose/typegoose";
import { User } from "./user.model";
import { Job } from "./job.model";

export const APPLICATION_STATUSES = [
  "pending",
  "reviewing",
  "accepted",
  "rejected",
  "withdrawn",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "applications",
  },
})
@index({ job: 1 })
@index({ applicant: 1 })
export class Application {
  @prop({ ref: () => Job, required: true })
  job!: Ref<Job>;

  @prop({ ref: () => User, required: true })
  applicant!: Ref<User>;

  @prop()
  coverLetter?: string;

  @prop()
  resumeUrl?: string;

  @prop({ enum: APPLICATION_STATUSES, default: "pending" })
  status!: ApplicationStatus;

  @prop()
  notes?: string;

  @prop()
  appliedAt?: Date;
}

export const ApplicationModel = getModelForClass(Application);
