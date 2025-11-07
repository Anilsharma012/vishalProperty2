import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
  title: string;
  slug: string;
  price: number;
  propertyType: string;
  status: 'active' | 'draft' | 'sold';
  location: string;
  city?: string;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  features: string[];
  description: string;
  images: string[];
  coverImage?: string;
  premium?: boolean;
  ownerContact: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const propertySchema = new Schema<IProperty>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    price: { type: Number, required: true },
    propertyType: { type: String, required: true },
    status: { type: String, enum: ['active', 'draft', 'sold'], default: 'draft' },
    location: { type: String, required: true },
    city: { type: String },
    area: { type: Number },
    bedrooms: { type: Number },
    bathrooms: { type: Number },
    features: [{ type: String }],
    description: { type: String, required: true },
    images: [{ type: String }],
    coverImage: { type: String },
    premium: { type: Boolean, default: false },
    ownerContact: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export default mongoose.model<IProperty>('Property', propertySchema);
