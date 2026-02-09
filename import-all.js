require('dotenv').config();
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function importAll() {
    console.log('🚀 Starting complete data import...\n');
    
    try {
        console.log('📊 Step 1/4: Importing Groups...');
        await execPromise('node import-groups.js');
        console.log('✅ Groups imported successfully!\n');
        
        console.log('👥 Step 2/4: Importing Teams...');
        await execPromise('node import-teams.js');
        console.log('✅ Teams imported successfully!\n');
        
        console.log('🏟️  Step 3/4: Importing Stadiums...');
        await execPromise('node import-stadiums.js');
        console.log('✅ Stadiums imported successfully!\n');
        
        console.log('⚽ Step 4/4: Importing Matches...');
        await execPromise('node import-matches.js');
        console.log('✅ Matches imported successfully!\n');
        
        console.log('🎉 All data imported successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Summary:');
        console.log('  ✓ 12 Groups (A-L)');
        console.log('  ✓ 48 Teams');
        console.log('  ✓ 16 Stadiums');
        console.log('  ✓ 104 Matches');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
    } catch (error) {
        console.error('❌ Error during import:', error.message);
        process.exit(1);
    }
}

importAll();
