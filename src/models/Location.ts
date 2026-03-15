import mongoose, { Schema, Document, Model } from "mongoose";

export const CATEGORIES = [
  "Beaches",
  "Mountains",
  "Monuments",
  "Cities",
  "Forests",
  "Lakes",
  "Deserts",
  "Valleys",
  "Hill Stations",
  "Waterfalls",
  "Islands",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Festival {
  name: string;
  month: string;
  description: string;
}

export interface PackingItem {
  item: string;
  icon: string;
}

export interface SeasonalPacking {
  season: string;
  months: string;
  items: PackingItem[];
}

export interface ILocation extends Document {
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  bgImage: string;
  cardImage: string;
  gradient: string;
  accentColor: string;
  coordinates: string;
  category: Category;
  bestTimeToVisit: string;
  state: string;
  highlights: string[];
  funFacts: string[];
  festivals: Festival[];
  packingEssentials: SeasonalPacking[];
}

const LocationSchema = new Schema<ILocation>(
  {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    description: { type: String, required: true },
    longDescription: { type: String, default: "" },
    bgImage: { type: String, required: true },
    cardImage: { type: String, required: true },
    gradient: { type: String, required: true },
    accentColor: { type: String, required: true },
    coordinates: { type: String, required: true },
    category: { type: String, enum: CATEGORIES, required: true },
    bestTimeToVisit: { type: String, required: true },
    state: { type: String, required: true },
    highlights: [{ type: String }],
    funFacts: [{ type: String }],
    festivals: [
      {
        name: { type: String },
        month: { type: String },
        description: { type: String },
      },
    ],
    packingEssentials: [
      {
        season: { type: String },
        months: { type: String },
        items: [
          {
            item: { type: String },
            icon: { type: String },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const Location: Model<ILocation> =
  mongoose.models.Location || mongoose.model<ILocation>("Location", LocationSchema);

export default Location;
