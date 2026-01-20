import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { job_text, url } = body;

    // Decide which backend endpoint to call
    let endpoint = "/analyze";

    // If URL exists → send to /analyze-link
    if (url && typeof url === "string" && url.startsWith("http")) {
      endpoint = "/analyze-link";
    }

    const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL + endpoint;

    const res = await fetch(backendURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    let data;

    // Try decoding backend response
    try {
      data = await res.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON returned from backend" },
        { status: 500 }
      );
    }

    // If backend returned an error (status NOT ok)
    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || "Backend error" },
        { status: res.status }
      );
    }

    // Backend returned empty or invalid structure
    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { error: "Empty response from backend" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);

  } catch (e) {
    return NextResponse.json(
      { error: "Backend not reachable" },
      { status: 500 }
    );
  }
}
