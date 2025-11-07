import mongoose, { Schema, InferSchemaType } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin','user'], default: 'user', index: true },
  status: { type: String, enum: ['active','blocked'], default: 'active', index: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

UserSchema.index({ email: 1 }, { unique: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  // @ts-ignore
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function(candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export type UserDoc = InferSchemaType<typeof UserSchema> & { comparePassword(candidate: string): Promise<boolean> } & { _id: mongoose.Types.ObjectId };

export default mongoose.models.User || mongoose.model('User', UserSchema);
