import { Schema, model, Document} from 'mongoose';
import bcrypt from 'bcrypt';


export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  isLive?: boolean;
  viewerCount?: number;
  streamkey: string;
  avatarUrl?: string;
  createdAt?: Date;
}


const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isLive: { type: Boolean, default: false },
  viewerCount: { type: Number, default: 0 },
  streamkey: { type: String, required: true, unique: true },
  avatarUrl: { type: String, default: '' },
}, { timestamps: true });

userSchema.pre<IUser>('save', async function() {

  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

  } catch (error: any) {
    throw error;
  }
});

const User = model<IUser>('User', userSchema);


export default User;
