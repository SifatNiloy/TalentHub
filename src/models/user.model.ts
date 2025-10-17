import { prop, getModelForClass, modelOptions, index } from "@typegoose/typegoose";

export const USER_ROLES = ["job_seeker", "employer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "users",
  },
})
@index({ email: 1 }, { unique: true })
export class User {
  @prop({ required: true })
  name!: string;

  @prop({ required: true, unique: true })
  email!: string;

  @prop({ required: true })
  password!: string;

  @prop({ enum: USER_ROLES, default: "job_seeker" })
  role!: UserRole;

  @prop()
  resumeUrl?: string; // For job seekers

  @prop()
  companyName?: string; // For employers

  @prop()
  website?: string; // For employers
}

export const UserModel = getModelForClass(User);
