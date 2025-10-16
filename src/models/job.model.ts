import { getModelForClass, ModelOptions, Prop } from "@typegoose/typegoose";

@ModelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "jobs",
  },
})
export class Job {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  company!: string;

  @Prop({ required: true })
  location!: string;

  @Prop({ required: true })
  salaryRange!: { min: number; max: number };

  @Prop({ enum: ["Full-time", "Part-time", "Contract", "Internship", "Freelance"], required: true })
  employmentType!: string;

  @Prop({ type: Boolean, default: false })
  remote!: boolean;

  @Prop({ default: "Active" })
  status!: string;

  @Prop({ required: false })
  postedBy?: string; // employer id later when you add auth
}

export const JobModel = getModelForClass(Job);
