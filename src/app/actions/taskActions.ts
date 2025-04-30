// 3. Now update the server actions if you're using them

// app/actions/taskAction.ts
'use server';

import { revalidatePath } from 'next/cache';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

type Task = {
    _id: string;
    task: string;
    name?: string;
    email?: string;
    completed?: boolean;
};

// Add task function
export async function addTask(formData: FormData) {
    const task = formData.get('task')?.toString();
    const name = formData.get('name')?.toString() || '';
    const email = formData.get('email')?.toString() || '';

    if (!task) return;

    const client = await clientPromise;
    const db = client.db();
    await db.collection('tasks').insertOne({ task, name, email, completed: false });
    revalidatePath('/');
}

// Get tasks function
export async function getTasks(): Promise<Task[]> {
    const client = await clientPromise;
    const db = client.db();
    const tasks = await db.collection('tasks').find().toArray();
    return tasks.map(({ _id, task, name, email, completed }) => ({
        _id: _id.toString(),
        task,
        name: name || '',
        email: email || '',
        completed: completed || false
    }));
}

// Delete task function
export async function deleteTask(taskId: string): Promise<void> {
    const client = await clientPromise;
    const db = client.db();
    await db.collection('tasks').deleteOne({ _id: new ObjectId(taskId) });
    revalidatePath('/');
}

// Update task function
export async function updateTask(taskId: string, data: Partial<Task>): Promise<void> {
    const client = await clientPromise;
    const db = client.db();
    await db.collection('tasks').updateOne(
        { _id: new ObjectId(taskId) },
        { $set: data }
    );
    revalidatePath('/');
}