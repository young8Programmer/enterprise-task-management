import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Task } from '../entities/Task';
import { Comment } from '../entities/Comment';
import { ActivityLog } from '../entities/ActivityLog';
import { FileAttachment } from '../entities/FileAttachment';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'taskflow_db',
  synchronize: process.env.NODE_ENV === 'development' && process.env.DB_SYNC !== 'false',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Task, Comment, ActivityLog, FileAttachment],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
});
