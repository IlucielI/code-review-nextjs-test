import { NextResponse } from 'next/server';

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
}

const memoryStore: Map<string, TaskItem> = new Map();

export async function GET() {
  const tasks = Array.from(memoryStore.values());
  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.title || typeof body.title !== 'string') {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }
  const id = crypto.randomUUID();
  const task: TaskItem = { id, title: body.title.trim(), completed: false };
  memoryStore.set(id, task);
  return NextResponse.json({ task }, { status: 201 });
}
