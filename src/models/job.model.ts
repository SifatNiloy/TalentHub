import { prop, getModelForClass, modelOptions, index } from '@typegoose/typegoose';
import { Ref } from '@typegoose/typegoose';
import mongoose from 'mongoose';
import { Company } from './Company.model';
import { EMPLOYMENT_TYPES } from '../config/constants';

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
})
@index({ location: '2dsphere' })
export class Job {
  @prop({ required: true })
  title!: string;

  @prop()
  description?: string;

  // company reference (optional for now)
  @prop({ ref: () => Company, required: false })
  company?: Ref<Company>;

  @prop({
    type: () => Object,
    required: true,
    default: () => ({ type: 'Point', coordinates: [0, 0] }),
  })
  location!: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };

  @prop({ type: () => [String], default: [] })
  skills!: string[];

  @prop({ type: () => Object })
  salary?: { min?: number; max?: number; currency?: string };

  @prop({ enum: EMPLOYMENT_TYPES, default: 'full_time' })
  employmentType!: typeof EMPLOYMENT_TYPES[number];

  @prop({ default: false })
  remote!: boolean;

  @prop({ default: true })
  isActive!: boolean;

  @prop()
  postedAt?: Date;
}

export const JobModel = getModelForClass(Job);
