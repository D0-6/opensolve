import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      // Missing API key in environment
      return NextResponse.json({ error: "Server misconfiguration: IMGBB_API_KEY missing" }, { status: 500 });
    }

    const imgbbData = new FormData();
    imgbbData.append("image", image);

    const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: imgbbData,
    });

    if (!imgbbRes.ok) {
      const errorText = await imgbbRes.text();
      console.error("ImgBB upload error:", errorText);
      return NextResponse.json({ error: "Failed to upload to ImgBB" }, { status: 502 });
    }

    const json = await imgbbRes.json();
    return NextResponse.json({ success: true, data: { url: json.data.url } });
  } catch (error) {
    console.error("Error in image upload API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
