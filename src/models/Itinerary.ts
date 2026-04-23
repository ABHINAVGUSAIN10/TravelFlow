import mongoose, { Schema, Document, Model } from "mongoose";

export interface IItineraryRoute {
  mode: string;
  origin: string;
  destination: string;
  price: string;
  duration: string;
  distanceKm: number;
}

export interface IItineraryHotel {
  name: string;
  address?: string;
  price?: string;
  roomType?: string;
}

export interface IItineraryGuide {
  name: string;
  price: string;
}

export interface IItinerary extends Document {
  userId: mongoose.Types.ObjectId;
  source: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  travelers: number;
  totalCost: number;
  routeLegs: IItineraryRoute[];
  hotel: IItineraryHotel | null;
  guide: IItineraryGuide | null;
  status: "upcoming" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const ItinerarySchema = new Schema<IItinerary>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    source: { type: String, required: true },
    destination: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    travelers: { type: Number, required: true, default: 1 },
    totalCost: { type: Number, required: true, default: 0 },
    routeLegs: [{
      mode: { type: String },
      origin: { type: String },
      destination: { type: String },
      price: { type: String },
      duration: { type: String },
      distanceKm: { type: Number },
    }],
    hotel: {
      type: {
        name: { type: String },
        address: { type: String },
        price: { type: String },
        roomType: { type: String },
      },
      default: null,
    },
    guide: {
      type: {
        name: { type: String },
        price: { type: String },
      },
      default: null,
    },
    status: {
      type: String,
      enum: ["upcoming", "completed", "cancelled"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

const Itinerary: Model<IItinerary> =
  mongoose.models.Itinerary || mongoose.model<IItinerary>("Itinerary", ItinerarySchema);

export default Itinerary;
