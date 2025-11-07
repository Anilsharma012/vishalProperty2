import mongoose, { Schema, InferSchemaType } from 'mongoose';

const PropertySchema = new Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  propertyType: { type: String, required: true },
  status: { type: String, enum: ['draft','pending','approved','rejected'], default: 'draft', index: true },
  location: { type: String, required: true },
  features: [{ type: String }],
  description: { type: String, default: '' },
  images: [{ type: String }],
  coverImage: { type: String },
  premium: { type: Boolean, default: false },
  ownerContact: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

PropertySchema.index({ slug: 1 }, { unique: true });

export type PropertyDoc = InferSchemaType<typeof PropertySchema> & { _id: mongoose.Types.ObjectId };
export default mongoose.models.Property || mongoose.model('Property', PropertySchema);
