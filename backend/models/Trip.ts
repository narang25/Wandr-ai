import mongoose, { Schema, Document } from 'mongoose';

export interface ITrip extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  destination: string;
  startDate: Date;
  days: number;
  budget: 'Budget' | 'Mid-Range' | 'Luxury';
  interests: string[];
  status: 'pending' | 'generating' | 'ready' | 'error';
  itinerary: any[]; // Defined in types, kept flexible in DB for AI generation
  budgetBreakdown: any;
  hotels: any[];
  quickFacts: any;
  createdAt: Date;
  updatedAt: Date;
}

const tripSchema = new Schema<ITrip>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    destination: { type: String, required: true },
    startDate: { type: Date, required: true },
    days: { type: Number, required: true, min: 1, max: 21 },
    budget: { type: String, enum: ['Budget', 'Mid-Range', 'Luxury'], required: true },
    interests: { type: [String], required: true },
    status: {
      type: String,
      enum: ['pending', 'generating', 'ready', 'error'],
      default: 'pending',
    },
    itinerary: { type: [], default: [] },
    budgetBreakdown: { type: Schema.Types.Mixed, default: {} },
    hotels: { type: [], default: [] },
    quickFacts: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const Trip = mongoose.model<ITrip>('Trip', tripSchema);
