require('dotenv').config();
const mongoose = require('./database');
const Team = require('./models/team');
const Group = require('./models/group');
const fs = require('fs');

async function importTeams() {
    try {
        console.log('Connecting to MongoDB...');
        
        // Wait for connection
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('Clearing existing teams...');
        // Drop the teams collection
        await mongoose.connection.db.dropCollection('teams').catch(() => {
            console.log('Collection does not exist yet, will create new one');
        });
        
        console.log('Reading teams file...');
        const teamsData = JSON.parse(
            fs.readFileSync('./football.teams.json', 'utf8')
        );
        
        console.log(`Found ${teamsData.length} teams to import`);
        
        // Import teams - only JSON fields
        for (const item of teamsData) {
            const teamData = {
                id: item.id,
                name_en: item.name_en,
                name_fa: item.name_fa,
                flag: item.flag || '',
                fifa_code: item.fifa_code,
                iso2: item.iso2,
                groups: item.groups
            };
            
            console.log(`Creating team ${teamData.name_en} in group ${item.groups}...`);
            await Team.create(teamData);
        }
        
        console.log('\n✅ Import completed successfully!');
        console.log(`Total teams imported: ${teamsData.length}`);
        
        // Verify
        const count = await Team.countDocuments();
        console.log(`Teams in database: ${count}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during import:', error);
        process.exit(1);
    }
}

// Run import
importTeams();
