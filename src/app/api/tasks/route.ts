//app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    const client = await clientPromise;
    const db = client.db();
    const tasks = await db.collection('tasks').find().toArray();

    return NextResponse.json(tasks.map(task => ({
        _id: task._id.toString(),
        task: task.task,
        completed: task.completed || false,
    })));
}

export async function POST(req: NextRequest) {
    const { task } = await req.json();
    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection('tasks').insertOne({ task, completed: false });

    return NextResponse.json({
        _id: result.insertedId.toString(),
        task,
        completed: false,
    });
}
