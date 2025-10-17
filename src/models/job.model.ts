import { getModelForClass, ModelOptions, Prop } from "@typegoose/typegoose";

class SalaryRange {
  @Prop({ required: true })
  min!: number;

  @Prop({ required: true })
  max!: number;
}

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

  @Prop({ type: () => SalaryRange, required: true })
  salaryRange!: SalaryRange;

  @Prop({ enum: ["Full-time", "Part-time", "Contract", "Internship", "Freelance"], required: true })
  employmentType!: string;

  @Prop({ type: Boolean, default: false })
  remote!: boolean;

  @Prop({ default: "Active" })
  status!: string;

  @Prop({ required: false })
  postedBy?: string;
}

export const JobModel = getModelForClass(Job);
