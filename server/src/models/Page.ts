import mongoose, { Schema, InferSchemaType } from 'mongoose';

const PageSchema = new Schema({
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, default: '' },
  metaTitle: { type: String },
  metaDescription: { type: String },
}, { timestamps: { createdAt: false, updatedAt: true } });

PageSchema.index({ slug: 1 }, { unique: true });

export type PageDoc = InferSchemaType<typeof PageSchema> & { _id: mongoose.Types.ObjectId };
export default mongoose.models.Page || mongoose.model('Page', PageSchema);
