import mongoose, { Schema, Document } from 'mongoose';

export interface IEnquiry extends Document {
  name: string;
  email?: string;
  phone: string;
  message: string;
  propertyId?: mongoose.Types.ObjectId;
  status: 'new' | 'reviewed' | 'closed';
  createdAt: Date;
}

const enquirySchema = new Schema<IEnquiry>(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true },
    message: { type: String, required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property' },
    status: { type: String, enum: ['new', 'reviewed', 'closed'], default: 'new' }
  },
  { timestamps: true }
);

export default mongoose.model<IEnquiry>('Enquiry', enquirySchema);
