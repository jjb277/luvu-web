import { createClient } from '@supabase/supabase-js';

const SB_URL = 'https://ltuhcgonetthvgzyhzea.supabase.co';
const SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0dWhjZ29uZXR0aHZnenloemVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU4NTgsImV4cCI6MjA4NzUyMTg1OH0.ak-DlSr_hFI_8GbZxfcvbOWbpA0qfEbUfX54f3aNbBc';

export const supabase = createClient(SB_URL, SB_ANON);

export type Event = {
  id: string;
  title: string;
  short_tagline: string | null;
  description: string | null;
  category: string | null;
  event_date: string;
  venue_name: string | null;
  city: string | null;
  base_price: number | null;
  primary_image_url: string | null;
  event_language: string | null;
  organizers: { company_name: string } | null;
};
