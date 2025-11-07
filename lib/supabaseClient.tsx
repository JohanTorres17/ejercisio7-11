import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gesqcrhfecpotryniosx.supabase.co";
const supabaseAnonKey ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdlc3FjcmhmZWNwb3RyeW5pb3N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MjQ1MzEsImV4cCI6MjA3ODEwMDUzMX0.0iBmBV4Tx2Hwj9gV9byaWhKxV6597d8qS2I6TNJ5L1Q";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);