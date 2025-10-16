import { prop, getModelForClass, modelOptions } from '@typegoose/typegoose';

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
})
export class Company {
  @prop({ required: true })
  name!: string;

  @prop()
  website?: string;

  @prop()
  logoUrl?: string;

  @prop()
  description?: string;
}

export const CompanyModel = getModelForClass(Company);
export type Company = Company;
