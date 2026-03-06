import { NextResponse } from "next/server";
import { serverStorageService } from "@/services/serverStorageService";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // In a real app, verify session/admin status here from headers/cookies
    await serverStorageService.deleteStory(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
