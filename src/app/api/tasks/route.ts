
// 1. FIRST: Let's update the API task routes to handle name and email

// app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    const client = await clientPromise;
    const db = client.db();
    const tasks = await db.collection('tasks').find().toArray();

    return NextResponse.json(tasks.map(task => ({
        _id: task._id.toString(),
        task: task.task,
        name: task.name || '',
        email: task.email || '',
        completed: task.completed || false,
    })));
}

export async function POST(req: NextRequest) {
    const { task, name, email } = await req.json();

    // Basic validation
    if (!task) {
        return NextResponse.json({ message: 'Task is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection('tasks').insertOne({
        task,
        name: name || '',
        email: email || '',
        completed: false
    });

    return NextResponse.json({
        _id: result.insertedId.toString(),
        task,
        name: name || '',
        email: email || '',
        completed: false,
    });
}