import { NextResponse } from "next/server";
import { serverStorageService } from "@/services/serverStorageService";

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();
    const user = await serverStorageService.loginUser(identifier, password);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
