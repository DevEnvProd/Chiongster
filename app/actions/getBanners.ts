"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getBanners() {
  try {
    const currentDate = new Date().toISOString();

    const { data, error } = await supabase
      .from("banner")
      .select("*")
      .lte("start_date", currentDate)
      .order("sequence", { ascending: true, nullsLast: true });

    if (error) throw error;

    return data.filter(
      (banner) => banner.start_date && (!banner.end_date || new Date(banner.end_date) > new Date())
    );
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
}

