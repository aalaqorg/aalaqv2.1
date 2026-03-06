import { NextResponse } from "next/server";
import { serverStorageService } from "@/services/serverStorageService";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { username } = await request.json();
    await serverStorageService.toggleBookmark(id, username);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
