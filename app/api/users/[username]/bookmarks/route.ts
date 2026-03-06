import { NextResponse } from "next/server";
import { serverStorageService } from "@/services/serverStorageService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const user = await serverStorageService.getUser(username);
    if (!user) return NextResponse.json([]);
    return NextResponse.json(user.bookmarks.map((b: any) => b.storyId));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
