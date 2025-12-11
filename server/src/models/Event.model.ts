import mongoose, { Schema } from 'mongoose';

export interface IEvent {
  type: 'upload' | 'checkout_started' | 'inscription_complete' | 'error';
  userId?: string;
  email?: string;
  metadata: Record<string, any>;
  utmSource?: string;  // utm_source (e.g., 'instagram', 'tiktok', 'youtube')
  utmCampaign?: string; // utm_campaign (e.g., 'christmas_sale_2025')
  utmMedium?: string;   // utm_medium (e.g., 'paid_social', 'cpc')
  utmContent?: string;  // utm_content (e.g., 'carousel_ad_1')
  createdAt: Date;
}

const EventSchema = new Schema<IEvent>({
  type: { type: String, enum: ['upload', 'checkout_started', 'inscription_complete', 'error'], required: true },
  userId: { type: String },
  email: { type: String },
  metadata: { type: Schema.Types.Mixed, default: {} },
  utmSource: { type: String, default: 'direct' },
  utmCampaign: { type: String, default: 'organic' },
  utmMedium: { type: String, default: 'organic' },
  utmContent: { type: String },
  createdAt: { type: Date, default: Date.now, index: { expires: 86400 * 30 } }, // 30-day TTL
});

export default mongoose.model<IEvent>('Event', EventSchema);
