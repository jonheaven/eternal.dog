import mongoose, { Schema } from 'mongoose';

export interface ITempUpload {
  userId: string;
  image: Buffer;
  text: string;
  expiresAt: Date;
}

const TempUploadSchema = new Schema<ITempUpload>({
  userId: { type: String, required: true, index: true },
  image: { type: Buffer, required: true },
  text: { type: String, required: true, maxlength: 100 },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 },
  },
});

export default mongoose.model<ITempUpload>(
  'TempUpload',
  TempUploadSchema,
);
