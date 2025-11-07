import mongoose, { Schema, InferSchemaType } from 'mongoose';

const EnquirySchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String },
  phone: { type: String, required: true },
  message: { type: String, required: true },
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property' },
  status: { type: String, enum: ['new','in_progress','closed'], default: 'new', index: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

export type EnquiryDoc = InferSchemaType<typeof EnquirySchema> & { _id: mongoose.Types.ObjectId };
export default mongoose.models.Enquiry || mongoose.model('Enquiry', EnquirySchema);
