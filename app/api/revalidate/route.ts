import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    // Get the path to revalidate from the query params
    const path = request.nextUrl.searchParams.get('path');
    
    if (!path) {
      return NextResponse.json({ error: 'Path parameter is missing' }, { status: 400 });
    }

    // Revalidate the path
    revalidatePath(path);

    return NextResponse.json({ 
      revalidated: true, 
      now: Date.now(),
      path 
    });
  } catch (error) {
    console.error('Error revalidating path:', error);
    return NextResponse.json({ 
      error: 'Error revalidating path', 
      message: (error as Error).message 
    }, { status: 500 });
  }
}