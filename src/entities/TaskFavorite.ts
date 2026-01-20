import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { User } from './User';
import { Task } from './Task';

@Entity('task_favorites')
@Unique(['userId', 'taskId'])
@Index(['userId', 'taskId'])
export class TaskFavorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @Column()
  taskId: string;

  @CreateDateColumn()
  createdAt: Date;
}
