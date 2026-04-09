const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// 1. Configuration
const userId = process.argv[2];
if (!userId) {
  console.error('Error: Please provide a userId as an argument.');
  console.log('Usage: node scripts/seed_dev.js <YOUR_USER_ID>');
  process.exit(1);
}

// 2. Load Environment Variables
try {
  const envFile = fs.readFileSync('.env', 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim();
  });
} catch (err) {
  console.warn('Warning: .env file not found, using process.env directly.');
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY must be defined in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 3. Seed Logic
async function seedData() {
  console.log(`Starting seed for user: ${userId}...`);

  try {
    // Note: We use the ANON key, so RLS must allow these operations 
    // or the database must be in a state where the script can insert.
    // If you get a 'new row violates row-level security', run the provided SQL script instead.

    // A. Add 3 months of cycle data
    const entries = [
      { date: '2026-04-07', is_period_day: true, symptoms: { flow: 'medium', mood: 'low', energy: 'low', cramps: 'moderate', sleepHours: 7, stressLevel: 'medium' } },
      { date: '2026-04-08', is_period_day: true, symptoms: { flow: 'heavy', mood: 'low', energy: 'low', cramps: 'severe', sleepHours: 6, stressLevel: 'high' } },
      { date: '2026-04-09', is_period_day: true, symptoms: { flow: 'medium', mood: 'stable', energy: 'medium', cramps: 'mild', sleepHours: 8, stressLevel: 'low' } },
      { date: '2026-03-11', is_period_day: true, symptoms: { flow: 'medium', mood: 'low', energy: 'low', cramps: 'moderate', sleepHours: 7, stressLevel: 'medium' } },
      { date: '2026-03-12', is_period_day: true, symptoms: { flow: 'heavy', mood: 'low', energy: 'low', cramps: 'severe', sleepHours: 6, stressLevel: 'medium' } },
      { date: '2026-02-12', is_period_day: true, symptoms: { flow: 'medium', mood: 'low', energy: 'low', cramps: 'moderate', sleepHours: 7, stressLevel: 'high' } },
    ];

    // B. Add wellness logs for recent days
    for (let i = 1; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i - 3); // some dates in early April
        const dateStr = d.toISOString().slice(0, 10);
        if (!entries.some(e => e.date === dateStr)) {
            entries.push({
                date: dateStr,
                is_period_day: false,
                symptoms: { flow: 'none', mood: 'high', energy: 'high', cramps: 'none', sleepHours: 8, stressLevel: 'low' }
            });
        }
    }

    const newEntries = entries.map(e => ({
      user_id: userId,
      ...e
    }));

    console.log(`Inserting ${newEntries.length} entries...`);
    const { error: insertError } = await supabase.from('cycle_entries').insert(newEntries);
    if (insertError) throw insertError;

    // C. Update profile
    const profileUpdates = {
      average_cycle_length: 28,
      average_period_length: 5,
      last_period_start: '2026-04-07',
      has_completed_onboarding: true
    };

    console.log('Updating profile...');
    const { error: profileError } = await supabase.from('profiles').update(profileUpdates).eq('id', userId);
    if (profileError) throw profileError;

    console.log('Seed completed successfully!');
    console.log('Please pull-to-refresh the app to see your new data.');

  } catch (err) {
    console.error('Seed FAILED:', err.message);
    if (err.message.includes('RLS')) {
        console.log('\nTIP: Since I am using the Anon Key, Supabase might block this script.');
        console.log('If it fails, please copy and run the provided SQL script in your Supabase Dashboard instead.');
    }
  }
}

seedData();
