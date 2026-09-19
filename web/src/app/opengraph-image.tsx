import { ImageResponse } from "next/og"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Ninebox"

export default function OG() {
  const cells = [0, 1, 2]
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: "flex", alignItems: "center", gap: 72, padding: 96, background: "#fafafa", color: "#18181b", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexWrap: "wrap", width: 300, height: 300, gap: 12 }}>
          {cells.flatMap((row) =>
            cells.map((col) => (
              <div key={`${row}-${col}`} style={{ width: 92, height: 92, borderRadius: 18, background: row === 0 && col === 2 ? "#34d399" : "#d4d4d8" }} />
            )),
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 88, fontWeight: 700, letterSpacing: -3 }}>Ninebox</div>
          <div style={{ fontSize: 34, color: "#52525b", maxWidth: 620, lineHeight: 1.3 }}>See where every student stands, and where they&apos;re heading.</div>
        </div>
      </div>
    ),
    size,
  )
}
