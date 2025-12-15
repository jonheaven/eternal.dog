import mongoose, { Schema } from 'mongoose';

export interface IDoginal {
  inscriptionId: string;
  ipfsCid: string;
  walletAddress: string;
  userEmail: string;
  imageSize: number;
  chunks: number;
  txid: string;
  blockHeight?: number;
  confirmedAt?: Date;
  createdAt: Date;
}

const DoginalSchema = new Schema<IDoginal>({
  inscriptionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  ipfsCid: { type: String, required: true },
  walletAddress: { type: String, required: true },
  userEmail: { type: String, required: true, index: true },
  imageSize: { type: Number, required: true }, // Image size in bytes
  chunks: { type: Number, required: true }, // Number of 520-byte chunks
  txid: { type: String, required: true, index: true }, // Dogecoin transaction ID
  blockHeight: { type: Number }, // Block height when confirmed
  confirmedAt: { type: Date }, // When transaction was confirmed
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IDoginal>('Doginal', DoginalSchema);
