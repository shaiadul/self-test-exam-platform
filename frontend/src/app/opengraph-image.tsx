import { ImageResponse } from "next/og";

export const alt = "Self Test - Online Exam & Assessment Platform";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0f172a",
          backgroundImage:
            "radial-gradient(circle at 25px 25px, #1e293b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1e293b 2%, transparent 0%)",
          backgroundSize: "100px 100px",
          padding: "60px 80px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Ambient Glows */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(249,122,0,0.3) 0%, rgba(249,122,0,0) 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-100px",
            width: "450px",
            height: "450px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(221,107,1,0.2) 0%, rgba(221,107,1,0) 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Top Header / Badge */}
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
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: "#f97a00",
              }}
            />
            <span
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#f97a00",
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              Online Exam & Assessment Platform
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#94a3b8",
              fontSize: "18px",
            }}
          >
            <span>v1.0 Ready</span>
          </div>
        </div>

        {/* Center Hero Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <h1
            style={{
              fontSize: "68px",
              fontWeight: 900,
              lineHeight: 1.1,
              color: "#ffffff",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            Self Test
            <span
              style={{
                background: "linear-gradient(135deg, #f97a00 0%, #ffae42 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              Exams
            </span>
          </h1>
          <p
            style={{
              fontSize: "26px",
              lineHeight: 1.4,
              color: "#cbd5e1",
              maxWidth: "880px",
              margin: 0,
            }}
          >
            Practice smart mock tests, receive automated instant scorecards, and master every topic with detailed analytics.
          </p>
        </div>

        {/* Bottom Feature Tags & Domain */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            paddingTop: "28px",
          }}
        >
          <div style={{ display: "flex", gap: "16px" }}>
            {["Instant Evaluation", "Topic Analytics", "Curated Question Sets"].map((tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  color: "#f8fafc",
                  fontSize: "16px",
                  fontWeight: 600,
                }}
              >
                {tag}
              </div>
            ))}
          </div>

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
