import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function test() {
  try {
    console.log("Testing notes upvotes column...");
    const { data, error } = await supabase.from('notes').select('upvotes').limit(1);
    if (error) {
      console.log("Supabase Error Object:", JSON.stringify(error, null, 2));
    } else {
      console.log("Success! Data:", data);
    }
  } catch (err) {
    console.log("Caught Error:", err);
  }
}

test();
