import { z } from 'zod';
import { TaskStatus, TaskPriority } from '../entities/Task';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
    description: z.string().min(1, 'Description is required'),
    priority: z.nativeEnum(TaskPriority).optional(),
    deadline: z.string().datetime().optional().or(z.date().optional()),
    assignedToId: z.string().uuid().optional().nullable(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    deadline: z.string().datetime().optional().or(z.date().optional()),
    assignedToId: z.string().uuid().optional().nullable(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
});

export const getTasksSchema = z.object({
  query: z.object({
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    assignedToId: z.string().uuid().optional(),
    search: z.string().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  }),
});

export const getTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
});

export const deleteTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
});
