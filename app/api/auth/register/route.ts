import { NextResponse } from "next/server";
import { serverStorageService } from "@/services/serverStorageService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await serverStorageService.registerUser(body);
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
