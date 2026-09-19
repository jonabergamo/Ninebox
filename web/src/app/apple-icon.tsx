import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  const cells = [12, 26, 40]
  return new ImageResponse(
    (
      <div style={{ width: 180, height: 180, background: "#18181b", borderRadius: 40, position: "relative", display: "flex" }}>
        {cells.flatMap((y) =>
          cells.map((x) => (
            <div
              key={`${x}-${y}`}
              style={{
                position: "absolute",
                left: x * 2.8125,
                top: y * 2.8125,
                width: 34,
                height: 34,
                borderRadius: 9,
                background: x === 40 && y === 12 ? "#34d399" : "#52525b",
              }}
            />
          )),
        )}
      </div>
    ),
    size,
  )
}
