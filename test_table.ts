import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function checkTable() {
  console.log("Checking columns of calendar_events...");
  try {
    const { data, error } = await supabase.from('calendar_events').select('*').limit(1);
    console.log("Error:", error);
    console.log("Columns:", data && data.length > 0 ? Object.keys(data[0]) : "No rows to show structure");
  } catch(e) {
    console.log("Caught:", e);
  }
}

checkTable();
