import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';

// Command injection via child_process.exec with untrusted body parameter
export async function POST(req: NextRequest) {
    const body = await req.json();
    const cmd = body.cmd;
    return new Promise((resolve) => {
        exec(`ping -c 1 ${cmd}`, (err, stdout) => {
            resolve(NextResponse.json({ output: stdout }));
        });
    });
}
