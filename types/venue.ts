export interface Venue {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  location: string;
  price: string;
  min_spend: string;
  address: string;
  happy_hours: string;
  night_hours: string;
  image_url: string;
  discount: string;
  slug: string;
  venue_name: string;
  category_name: string;
  drink_min_spend: string;
  morning_hours: string;
  recommended: string;
  playability: string;
  mondayOH: string;
  tuesdayOH: string;
  wednesdayOH: string;
  thursdayOH: string;
  fridayOH: string;
  saturdayOH: string;
  sundayOH: string;
  minimum_tips: string;
  promotion_pic_path?: string | null;
  event_pic_path?: string | null;
  languages: string;
  similar_place_id: string;
  pic_path?: string | null;
}

export interface VenueDamage {
  id: string
  venue_id: string
  room_type: string
  pax: string
  min_spend: string
  happy_hour_price: string
  night_hour_price: string
  morning_hour_price: string
}

export interface VenueMenuItem {
  id: string
  item_name: string
  item_description: string
  original_price: string
}

export interface ImagePromotion {
  id: string
  image_path: string
}

