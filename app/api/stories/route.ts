import { NextResponse } from "next/server";
import { serverStorageService } from "@/services/serverStorageService";

export async function GET() {
  try {
    const stories = await serverStorageService.getStories();
    return NextResponse.json(stories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const story = await serverStorageService.publishStory(body);
    return NextResponse.json(story);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
