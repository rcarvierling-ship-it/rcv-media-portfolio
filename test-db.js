const { sql } = require('@vercel/postgres');

async function testDatabase() {
    try {
        console.log('Testing database connection...');

        // Test basic connection
        const result = await sql`SELECT NOW()`;
        console.log('✓ Database connected:', result.rows[0]);

        // Check if pages table exists
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'pages'
        `;

        if (tables.rows.length === 0) {
            console.log('✗ Pages table does NOT exist');
            console.log('Creating pages table...');

            await sql`
                CREATE TABLE IF NOT EXISTS pages (
                    id TEXT PRIMARY KEY,
                    slug TEXT UNIQUE NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT,
                    content JSONB DEFAULT '{}',
                    blocks JSONB DEFAULT '[]',
                    status TEXT DEFAULT 'draft',
                    version INTEGER DEFAULT 1,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `;
            console.log('✓ Pages table created');
        } else {
            console.log('✓ Pages table exists');

            // Check table schema
            const columns = await sql`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'pages'
                ORDER BY ordinal_position
            `;
            console.log('Table schema:');
            columns.rows.forEach(col => {
                console.log(`  - ${col.column_name}: ${col.data_type}`);
            });
        }

        // Try to query pages
        const pages = await sql`SELECT * FROM pages LIMIT 5`;
        console.log(`✓ Found ${pages.rows.length} pages in database`);

    } catch (error) {
        console.error('✗ Database error:', error.message);
        console.error('Full error:', error);
    }
}

testDatabase();
