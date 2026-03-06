import { NextResponse } from "next/server";
import { serverStorageService } from "@/services/serverStorageService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user1 = searchParams.get('user1');
  const user2 = searchParams.get('user2');
  
  if (!user1 || !user2) {
      return NextResponse.json({ error: "Users required" }, { status: 400 });
  }

  try {
    const messages = await serverStorageService.getConversation(user1, user2);
    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
