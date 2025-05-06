import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jupmdlvbxnaqmaaliblr.supabase.co"
const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_KEY!);
