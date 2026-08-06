import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
          fontSize: 60,
          color: "black",
        }}
      >
        Hello World
      </div>
    ),
    {
      width: 800,
      height: 400,
    }
  );
}
