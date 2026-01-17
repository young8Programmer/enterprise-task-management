import { z } from 'zod';

export const createCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Comment content is required'),
  }),
  params: z.object({
    taskId: z.string().uuid('Invalid task ID'),
  }),
});

export const updateCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Comment content is required'),
  }),
  params: z.object({
    id: z.string().uuid('Invalid comment ID'),
  }),
});

export const deleteCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid comment ID'),
  }),
});
