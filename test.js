import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tyqbbpctqevfcgbroekd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5cWJicGN0cWV2ZmNnYnJvZWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NzEzODksImV4cCI6MjA5MTM0NzM4OX0.uJlfbfAPJ50EzrDVf0C7zn_c4IckxiEnQrxVYuv8v6E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log("Checking profiles table...");
  const { data: profiles, error: err1 } = await supabase.from('profiles').select('*');
  console.log("Profiles:", profiles);
  if (err1) console.error("Error fetching profiles:", err1);
}

checkDatabase();
