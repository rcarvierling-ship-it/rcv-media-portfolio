const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Basic env parser
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function updateTheme() {
    console.log('Syncing site vibe to Neon Green (#C8FF00)...');
    
    // 1. Update site_settings
    const { data: settings, error: settingsError } = await supabase
        .from('site_settings')
        .update({ accent_color: '#C8FF00' })
        .eq('id', '3600f935-7634-45e3-96cb-236b377b678c'); // From schema.sql seed
    
    if (settingsError) {
        // Try without ID filter if it fails (maybe different ID)
        const { error: error2 } = await supabase
            .from('site_settings')
            .update({ accent_color: '#C8FF00' })
            .is('accent_color', 'not.null'); // Update all records just in case
        
        if (error2) console.error('Error updating settings:', error2);
        else console.log('Settings updated successfully (fallback).');
    } else {
        console.log('Settings updated successfully.');
    }

    // 2. Update pricing packages to also use the new accent
    const { error: pkgError } = await supabase
        .from('pricing_packages')
        .update({ accent_color: '#C8FF00' });
    
    if (pkgError) console.error('Error updating packages:', pkgError);
    else console.log('Pricing packages synchronized.');

    console.log('Global Design System Synchronized.');
}

updateTheme();
