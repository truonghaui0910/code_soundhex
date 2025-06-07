
import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const logsDir = join(process.cwd(), 'logs');
    const files = readdirSync(logsDir);
    
    const { searchParams } = new URL(request.url);
    const file = searchParams.get('file');
    
    if (file && files.includes(file)) {
      const content = readFileSync(join(logsDir, file), 'utf-8');
      return NextResponse.json({ 
        file, 
        content: content.split('\n').filter(line => line.trim()) 
      });
    }
    
    return NextResponse.json({ files });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read logs' }, { status: 500 });
  }
}
