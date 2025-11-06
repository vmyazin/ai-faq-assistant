import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.local
const envPath = join(process.cwd(), '.env.local');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
} catch (error) {
  console.error('❌ Could not load .env.local file');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database...\n');

  try {
    // Test connection
    console.log('1️⃣ Testing connection...');
    const { data, error } = await supabase.from('_healthcheck').select('*').limit(1);
    if (error && error.code !== 'PGRST116') {
      // PGRST116 means table doesn't exist, which is fine
      console.log('✅ Connection successful!\n');
    }

    // Note: The schema needs to be run via SQL Editor or psql
    // The anon key doesn't have permissions to create extensions and tables
    console.log('2️⃣ Database schema setup:');
    console.log('\n📋 To set up your database, please:');
    console.log('   1. Go to: https://owtiyhumefjdiurgbgdu.supabase.co');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Create a new query');
    console.log('   4. Copy the contents of: supabase/schema.sql');
    console.log('   5. Paste and run the SQL\n');

    console.log('3️⃣ Verifying tables exist...');

    // Check if tables exist
    const tables = ['documents', 'crawl_jobs', 'conversations', 'messages'];
    for (const table of tables) {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`   ⚠️  Table "${table}" does not exist yet`);
        } else {
          console.log(`   ❌ Error checking table "${table}":`, error.message);
        }
      } else {
        console.log(`   ✅ Table "${table}" exists`);
      }
    }

    console.log('\n✨ Setup verification complete!');
    console.log('\n💡 If tables don\'t exist, run the SQL schema in Supabase SQL Editor.');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setupDatabase();
