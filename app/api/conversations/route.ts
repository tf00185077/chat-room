import { getConversationList } from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const conversations = await getConversationList();
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
