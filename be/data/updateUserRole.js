// updateUserRole.js - Script to update user role to admin for testing
import mongoose from 'mongoose';
import User from '../src/models/User.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/auth_db');

const updateUserRole = async () => {
  try {
    // Find a user by email and update their role to admin
    const email = 'cogifi3476@anysilo.com'; // Replace with the email you're using to login

    const user = await User.findOneAndUpdate(
      { email: email },
      { role: 'admin' },
      { new: true }
    );

    if (user) {
      console.log('✅ User role updated successfully!');
      console.log(`User: ${user.name} (${user.email})`);
      console.log(`Role: ${user.role}`);
    } else {
      console.log('❌ User not found with email:', email);
      console.log('Available users:');
      const allUsers = await User.find({}, 'name email role');
      allUsers.forEach(u => console.log(`- ${u.name}: ${u.email} (${u.role})`));
    }

  } catch (error) {
    console.error('Error updating user role:', error);
  } finally {
    mongoose.connection.close();
  }
};

updateUserRole();
