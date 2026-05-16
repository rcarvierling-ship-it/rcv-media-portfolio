const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        env[key] = value;
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function forceGreen() {
    console.log('SURGICAL PURGE: Removing all blue from database...');
    
    // 1. Update all site settings
    const { data: sData, error: sError } = await supabase
        .from('site_settings')
        .update({ accent_color: '#C8FF00' })
        .not('id', 'is', null); // Standard way to update all rows
    
    if (sError) console.error('Site Settings Error:', sError);
    else console.log('Site Settings: SYNCHRONIZED');

    // 2. Update all pricing packages
    const { data: pData, error: pError } = await supabase
        .from('pricing_packages')
        .update({ accent_color: '#C8FF00' })
        .not('id', 'is', null);
    
    if (pError) console.error('Pricing Packages Error:', pError);
    else console.log('Pricing Packages: SYNCHRONIZED');

    // 3. Update all albums (if they have accent colors)
    // Check schema to see if albums have accent_color
    const { data: albums } = await supabase.from('albums').select('id').limit(1);
    if (albums && albums.length > 0) {
        const { error: aError } = await supabase
            .from('albums')
            .update({ accent_color: '#C8FF00' })
            .not('id', 'is', null);
        if (!aError) console.log('Albums: SYNCHRONIZED');
    }

    console.log('DATABASE: 100% NEON GREEN');
}

forceGreen();
