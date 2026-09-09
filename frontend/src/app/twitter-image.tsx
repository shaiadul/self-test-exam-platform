import { ImageResponse } from "next/og";

export const alt = "Self Test - Online Exam & Assessment Platform";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0b1120",
          backgroundImage:
            "radial-gradient(circle at 25px 25px, #1e293b 2%, transparent 0%)",
          backgroundSize: "60px 60px",
          padding: "60px 80px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "480px",
            height: "480px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(249,122,0,0.3) 0%, rgba(249,122,0,0) 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Top Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              backgroundColor: "rgba(249, 122, 0, 0.15)",
              border: "1px solid rgba(249, 122, 0, 0.4)",
              borderRadius: "9999px",
              padding: "8px 24px",
            }}
          >
            <span
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#f97a00",
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              Self Test Platform
            </span>
          </div>

          <span style={{ fontSize: "20px", fontWeight: 700, color: "#94a3b8" }}>
            @selftest
          </span>
        </div>

        {/* Center Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <h1
            style={{
              fontSize: "64px",
              fontWeight: 900,
              lineHeight: 1.15,
              color: "#ffffff",
              margin: 0,
            }}
          >
            Empower Your Exam Preparation With Real-Time Scoring
          </h1>
          <p
            style={{
              fontSize: "24px",
              color: "#cbd5e1",
              maxWidth: "850px",
              margin: 0,
            }}
          >
            Take comprehensive mock tests, analyze weaknesses, and track performance with intuitive analytics.
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            paddingTop: "24px",
          }}
        >
          <span style={{ fontSize: "18px", color: "#94a3b8" }}>
            Free practice exams available now
          </span>
          <span style={{ fontSize: "20px", fontWeight: 700, color: "#f97a00" }}>
            selftest.com
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
