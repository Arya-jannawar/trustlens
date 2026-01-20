import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/history");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("History fetch failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
