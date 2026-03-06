import { NextResponse } from "next/server";
import { serverStorageService } from "@/services/serverStorageService";

// Get Inbox
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  
  if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  try {
    const messages = await serverStorageService.getInbox(username);
    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Send Message
export async function POST(request: Request) {
  try {
    const { from, to, content } = await request.json();
    if (!from || !to || !content) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const message = await serverStorageService.sendMessage(from, to, content);
    return NextResponse.json(message);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
