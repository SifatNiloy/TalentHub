import { prop, getModelForClass, modelOptions, index } from '@typegoose/typegoose';

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
})
@index({ email: 1 })
export class User {
  @prop({ required: true })
  name!: string;

  @prop({ required: true, unique: true })
  email!: string;

  @prop({ default: 'job_seeker' })
  role!: string;

  // optional stored resume URL (single click apply)
  @prop()
  resumeUrl?: string;
}

export const UserModel = getModelForClass(User);
export type User = User;
