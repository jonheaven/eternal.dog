import mongoose, { Schema } from 'mongoose';

export interface IDoginal {
  inscriptionId: string;
  ipfsCid: string;
  badgeIpfsCid?: string; // DOGE ID badge IPFS CID
  walletAddress: string;
  userEmail: string;
  dogName?: string; // Dog's name
  description?: string; // Memory/description text
  dates?: string; // Birth/death dates
  isPublic: boolean; // Whether to show in gallery
  imageSize: number;
  chunks: number;
  txid: string;
  blockHeight?: number;
  confirmedAt?: Date;
  
  // Claim/Wallet system fields
  claimUuid?: string; // Unique UUID for claim link
  claimed: boolean; // Whether wallet has been claimed
  claimExpiryDate?: Date; // When claim link expires (30 days)
  tempWalletAddress?: string; // Temporary wallet before claiming
  tempPrivateKey?: string; // Temporary private key (encrypted, deleted after claim)
  tagInscriptionId?: string; // Optional tag inscription ID
  
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
  badgeIpfsCid: { type: String }, // Optional badge IPFS CID
  walletAddress: { type: String, required: true },
  userEmail: { type: String, required: true, index: true },
  dogName: { type: String }, // Dog's name
  description: { type: String }, // Memory/description (max 100 chars)
  dates: { type: String }, // Birth/death dates
  isPublic: { type: Boolean, default: true, index: true }, // Show in gallery
  imageSize: { type: Number, required: true }, // Image size in bytes
  chunks: { type: Number, required: true }, // Number of 520-byte chunks
  txid: { type: String, required: true, index: true }, // Dogecoin transaction ID
  blockHeight: { type: Number }, // Block height when confirmed
  confirmedAt: { type: Date }, // When transaction was confirmed
  
  // Claim/Wallet system
  claimUuid: { type: String, unique: true, sparse: true, index: true },
  claimed: { type: Boolean, default: false },
  claimExpiryDate: { type: Date },
  tempWalletAddress: { type: String },
  tempPrivateKey: { type: String }, // Should be encrypted in production
  tagInscriptionId: { type: String },
  
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IDoginal>('Doginal', DoginalSchema);
