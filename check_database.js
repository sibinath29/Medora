const db = require('../dbserver/config/database');

async function checkDatabase() {
    try {
        // Check tables
        const [tables] = await db.query('SHOW TABLES');
        console.log('\nExisting tables:');
        tables.forEach(table => {
            console.log(Object.values(table)[0]);
        });

        // For each table, show its structure
        for (const table of tables) {
            const tableName = Object.values(table)[0];
            const [structure] = await db.query(`DESCRIBE ${tableName}`);
            console.log(`\nStructure of ${tableName}:`);
            console.table(structure);
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        process.exit();
    }
}

checkDatabase(); 