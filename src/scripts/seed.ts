import 'reflect-metadata';
import dotenv from 'dotenv';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import { hashPassword } from '../utils/bcrypt';

dotenv.config();

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const userRepository = AppDataSource.getRepository(User);

    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@taskflow.com' },
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      await AppDataSource.destroy();
      return;
    }

    // Create admin user
    const adminPassword = await hashPassword('Admin123!');
    const admin = userRepository.create({
      email: 'admin@taskflow.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isEmailVerified: true,
      isActive: true,
    });

    await userRepository.save(admin);
    console.log('Admin user created successfully!');
    console.log('Email: admin@taskflow.com');
    console.log('Password: Admin123!');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    await AppDataSource.destroy();
    process.exit(1);
  }
}

seed();
