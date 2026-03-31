import { Schema, model, Document} from 'mongoose';
import bcrypt from 'bcrypt';
import { NextFunction,Request,Response } from 'express';


export interface IUser extends Document {
  id: string;
  username: string;
  email: string;
  password?: string;
  isLive?: boolean;
  viewerCount?: number;
  streamkey: string;
}


const userSchema = new Schema<IUser>({
  id: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isLive: { type: Boolean, default: false },
  viewerCount: { type: Number, default: 0 },
  streamkey: { type: String, required: true }
});

userSchema.pre<IUser>('save', async function() {

  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(10);
    (this as IUser).password = await bcrypt.hash(this.password as string, salt);

  } catch (error: any) {
    throw error;
  }
});

const User = model<IUser>('User', userSchema);



export default User;