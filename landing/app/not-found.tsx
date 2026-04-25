import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "60vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "80px 24px",
      textAlign: "center",
    }}>
      <div style={{
        fontSize: "clamp(4rem, 10vw, 8rem)",
        fontWeight: 800,
        lineHeight: 1,
        background: "linear-gradient(135deg, #ffd34d, #f4a300)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        marginBottom: 16,
      }}>
        404
      </div>
      <h1 style={{ margin: "0 0 12px", fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700 }}>
        Page not found
      </h1>
      <p style={{ margin: "0 0 40px", color: "var(--fg-dim)", maxWidth: 400, lineHeight: 1.7 }}>
        This page doesn&apos;t exist. If you followed a link, it may be outdated.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/" className="btn btn-primary">
          Home
        </Link>
        <Link href="/docs" className="btn">
          Docs
        </Link>
        <Link href="/download" className="btn">
          Download
        </Link>
      </div>
    </div>
  );
}
