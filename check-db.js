const mongoose = require('mongoose');
require('dotenv').config();

const checkDB = async () => {
  try {
    console.log('Attempting to connect to the database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected Successfully!');
    
    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\nCollections found:');
    if (collections.length === 0) {
      console.log('No collections found in the database.');
    } else {
      for (const collection of collections) {
        console.log(`- ${collection.name}`);
        // Get document count for each collection
        const count = await db.collection(collection.name).countDocuments();
        console.log(`  Count: ${count}`);
        
        // Fetch one document as sample
        if (count > 0) {
          const sample = await db.collection(collection.name).findOne();
          console.log(`  Sample Data:`, sample);
        }
      }
    }
  } catch (error) {
    console.error('Database connection failed:');
    console.error(error.message);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

checkDB();
