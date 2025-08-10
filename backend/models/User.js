const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

class User {
  constructor(userData) {
    this.id = userData.id;
    this.email = userData.email;
    this.password = userData.password;
    this.firebase_uid = userData.firebase_uid;
    this.display_name = userData.display_name;
    this.photo_url = userData.photo_url;
    this.provider = userData.provider;
    this.created_at = userData.created_at;
    this.last_login = userData.last_login;
    this.updated_at = userData.updated_at;
  }

  // Create a new user
  static async create(userData) {
    const { 
      email, 
      password, 
      firebase_uid, 
      display_name, 
      photo_url, 
      provider = 'email' 
    } = userData;
    
    // Hash password only if provided (not for Firebase/Google users)
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }
    
    try {
      const query = `
        INSERT INTO users (
          email, password, firebase_uid, display_name, photo_url, provider,
          created_at, last_login, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      
      const result = await pool.query(query, [
        email.toLowerCase().trim(), 
        hashedPassword, 
        firebase_uid, 
        display_name, 
        photo_url, 
        provider
      ]);
      return new User(result.rows[0]);
      
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('User already exists with this email');
      }
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await pool.query(query, [email.toLowerCase().trim()]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM users WHERE id = $1';
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Compare password
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  // Update last login
  async updateLastLogin() {
    try {
      const query = `
        UPDATE users 
        SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $1
        RETURNING last_login
      `;
      
      const result = await pool.query(query, [this.id]);
      this.last_login = result.rows[0].last_login;
      return this.last_login;
    } catch (error) {
      throw error;
    }
  }

  // Convert to JSON (exclude password)
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }

  // Get user data without password
  getSafeUserData() {
    return {
      id: this.id,
      email: this.email,
      display_name: this.display_name,
      photo_url: this.photo_url,
      provider: this.provider,
      created_at: this.created_at,
      last_login: this.last_login,
      updated_at: this.updated_at
    };
  }

  // Static method to update Firebase UID
  static async updateFirebaseUid(userId, firebaseUid) {
    try {
      const query = `
        UPDATE users 
        SET firebase_uid = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2
        RETURNING *
      `;
      
      const result = await pool.query(query, [firebaseUid, userId]);
      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Static method to update last login
  static async updateLastLogin(userId) {
    try {
      const query = `
        UPDATE users 
        SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $1
        RETURNING last_login
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows[0].last_login;
    } catch (error) {
      throw error;
    }
  }

  // Find user by Firebase UID
  static async findByFirebaseUid(firebaseUid) {
    try {
      const query = 'SELECT * FROM users WHERE firebase_uid = $1';
      const result = await pool.query(query, [firebaseUid]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;