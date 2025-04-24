//app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection('tasks').deleteOne({ _id: new ObjectId(params.id) });

    if (result.deletedCount === 0) {
        return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Task deleted' });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const { task, completed } = await req.json();
    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('tasks').updateOne(
        { _id: new ObjectId(params.id) },
        { $set: { ...(task && { task }), ...(completed !== undefined && { completed }) } }
    );

    return NextResponse.json({ message: 'Task updated' });
}
