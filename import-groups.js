require('dotenv').config();
const mongoose = require('./database');
const Group = require('./models/group');
const fs = require('fs');

async function importMatchTables() {
    try {
        console.log('Connecting to MongoDB...');
        
        // Wait for connection
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('Clearing existing groups...');
        // Drop the groups collection to remove all indexes and data
        await mongoose.connection.db.dropCollection('groups').catch(() => {
            console.log('Collection does not exist yet, will create new one');
        });
        
        console.log('Reading match tables file...');
        const matchTablesData = JSON.parse(
            fs.readFileSync('./football.matchtables.json', 'utf8')
        );
        
        console.log(`Found ${matchTablesData.length} groups to import`);
        
        // Import groups
        for (const item of matchTablesData) {
            const groupData = {
                name: item.group,
                teams: item.teams
            };
            
            console.log(`Creating group ${groupData.name} with ${groupData.teams.length} teams...`);
            await Group.create(groupData);
        }
        
        console.log('\n✅ Import completed successfully!');
        console.log(`Total groups imported: ${matchTablesData.length}`);
        
        // Verify
        const count = await Group.countDocuments();
        console.log(`Groups in database: ${count}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during import:', error);
        process.exit(1);
    }
}

// Run import
importMatchTables();
