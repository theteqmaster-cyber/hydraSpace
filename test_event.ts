import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function test() {
  console.log("Testing insert into calendar_events...");
  try {
    const { data, error } = await supabase.from('calendar_events').insert({
      title: 'Test Timeout',
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
      type: 'other',
      user_id: '00000000-0000-0000-0000-000000000000'
    }).select().single();
    
    console.log("Error:", error);
    console.log("Data:", data);
  } catch(e) {
    console.log("Caught:", e);
  }
}

test();
