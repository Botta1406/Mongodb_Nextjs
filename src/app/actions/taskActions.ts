//app/actions/taskAction.ts
'use server';

import { revalidatePath } from 'next/cache';
import clientPromise from '@/lib/mongodb';

type Task = {
    _id: string;
    task: string;
};

// Add task function
export async function addTask(formData: FormData) {
    const task = formData.get('task')?.toString();
    if (!task) return;

    const client = await clientPromise;
    const db = client.db();
    await db.collection('tasks').insertOne({ task });
    revalidatePath('/');
}

// Get tasks function
export async function getTasks(): Promise<Task[]> {
    const client = await clientPromise;
    const db = client.db();
    const tasks = await db.collection('tasks').find().toArray();
    return tasks.map(({ _id, task }) => ({ _id: _id.toString(), task }));
}

// Delete task function
export async function deleteTask(taskId: string): Promise<void> {
    const res = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
        method: 'DELETE',
        cache: 'no-store',
    });

    if (!res.ok) throw new Error('Failed to delete task');
    revalidatePath('/');
}
