const { Pool } = require('pg');

// Create PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'chatai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Create database if it doesn't exist
const createDatabaseIfNotExists = async () => {
  const { Pool } = require('pg');
  
  // Connect to default postgres database to create our database
  const adminPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // Connect to default postgres database
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    const client = await adminPool.connect();
    
    // Check if database exists
    const dbName = process.env.DB_NAME || 'chatai';
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );
    
    if (result.rows.length === 0) {
      // Database doesn't exist, create it
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Created database: ${dbName}`);
    } else {
      console.log(`✅ Database ${dbName} already exists`);
    }
    
    client.release();
    await adminPool.end();
    return true;
  } catch (error) {
    console.error('❌ Database creation error:', error.message);
    await adminPool.end();
    return false;
  }
};

// Test the connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error.message);
    return false;
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    
    // Create users table (basic version first)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if Firebase columns exist, if not add them
    const checkColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name IN ('firebase_uid', 'display_name', 'photo_url', 'provider')
    `);

    if (checkColumns.rows.length < 4) {
      console.log('🔄 Adding Firebase columns to users table...');
      
      // Add Firebase columns
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255),
        ADD COLUMN IF NOT EXISTS display_name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS photo_url TEXT,
        ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'email'
      `);
      
      // Make password nullable for Firebase users
      await client.query(`
        ALTER TABLE users 
        ALTER COLUMN password DROP NOT NULL
      `);
      
      console.log('✅ Firebase columns added successfully');
    }

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid)
    `);

    console.log('✅ Database tables initialized successfully');
    client.release();
    
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  }
};

// Connect to database and initialize tables
const connectDatabase = async () => {
  // First, create database if it doesn't exist
  await createDatabaseIfNotExists();
  
  // Then test connection to our database
  const isConnected = await testConnection();
  if (isConnected) {
    await initializeDatabase();
  }
  return isConnected;
};

module.exports = {
  pool,
  connectDatabase,
  testConnection
};