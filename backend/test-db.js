const MySQLDatabase = require('./mysql-database');
require('dotenv').config();

async function testDatabase() {
    console.log('🔧 Testing MySQL Database Connection...\n');
    
    const db = new MySQLDatabase();
    
    try {
        // Test 1: Connect to database
        console.log('1️⃣ Testing connection...');
        await db.connect();
        console.log('✅ Connection successful!\n');
        
        // Test 2: Check current notes
        console.log('2️⃣ Checking existing notes...');
        const existingNotes = await db.getAllNotes();
        console.log(`📊 Found ${existingNotes.length} existing notes`);
        existingNotes.forEach(note => {
            console.log(`   - #${note.id}: "${note.content.substring(0, 50)}..."`);
        });
        console.log();
        
        // Test 3: Add a test note
        console.log('3️⃣ Adding test note...');
        const testNote = await db.addNote('This is a test note from the test script', 'Test Note');
        console.log('✅ Test note added:', testNote);
        console.log();
        
        // Test 4: Retrieve notes again
        console.log('4️⃣ Checking notes after adding test note...');
        const updatedNotes = await db.getAllNotes();
        console.log(`📊 Now found ${updatedNotes.length} notes`);
        updatedNotes.forEach(note => {
            console.log(`   - #${note.id}: "${note.content.substring(0, 50)}..."`);
        });
        console.log();
        
        // Test 5: Database stats
        console.log('5️⃣ Getting database stats...');
        const stats = await db.getStats();
        console.log('📈 Stats:', stats);
        console.log();
        
        // Test 6: Raw SQL query to double-check
        console.log('6️⃣ Running raw SQL query...');
        const [rawRows] = await db.connection.execute('SELECT COUNT(*) as count FROM notes');
        console.log('🔍 Raw count query result:', rawRows[0]);
        
        const [allRawRows] = await db.connection.execute('SELECT * FROM notes LIMIT 3');
        console.log('🔍 Raw notes query (first 3):');
        allRawRows.forEach(row => {
            console.log(`   - ID: ${row.id}, Title: "${row.title}", Content: "${row.content.substring(0, 30)}..."`)
        });
        
        console.log('\n🎉 All tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Full error:', error);
    } finally {
        await db.close();
    }
}

// Run the test
testDatabase();