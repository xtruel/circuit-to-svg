import { expect, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import { convertCircuitJsonToSchematicSvg } from "lib"

const getTableBorderRealBounds = (svg: string) => {
  const [a, , , d, e, f] = svg
    .match(/data-real-to-screen-transform="matrix\(([^)]*)\)"/)![1]!
    .split(",")
    .map(Number) as number[]
  const rect = svg.match(/<rect class="sch-table-border"[^>]*>/)![0]
  const attr = (name: string) =>
    Number(rect.match(new RegExp(` ${name}="([^"]*)"`))![1])
  const x1 = (attr("x") - e!) / a!
  const x2 = (attr("x") + attr("width") - e!) / a!
  const y1 = (attr("y") - f!) / d!
  const y2 = (attr("y") + attr("height") - f!) / d!
  return {
    minX: Math.min(x1, x2),
    maxX: Math.max(x1, x2),
    minY: Math.min(y1, y2),
    maxY: Math.max(y1, y2),
  }
}

const cases = [
  // 2mm wide, 1mm tall table anchored at the origin
  { anchor: "top_center", expected: { minX: -1, maxX: 1, minY: -1, maxY: 0 } },
  {
    anchor: "bottom_center",
    expected: { minX: -1, maxX: 1, minY: 0, maxY: 1 },
  },
  {
    anchor: "center_left",
    expected: { minX: 0, maxX: 2, minY: -0.5, maxY: 0.5 },
  },
  {
    anchor: "center_right",
    expected: { minX: -2, maxX: 0, minY: -0.5, maxY: 0.5 },
  },
] as const

for (const { anchor, expected } of cases) {
  test(`schematic table anchor ${anchor} positions the table correctly`, () => {
    const circuitJson: AnyCircuitElement[] = [
      {
        type: "schematic_table",
        schematic_table_id: "table1",
        anchor_position: { x: 0, y: 0 },
        anchor,
        column_widths: [2],
        row_heights: [1],
      },
    ]

    const bounds = getTableBorderRealBounds(
      convertCircuitJsonToSchematicSvg(circuitJson),
    )
    expect(bounds.minX).toBeCloseTo(expected.minX)
    expect(bounds.maxX).toBeCloseTo(expected.maxX)
    expect(bounds.minY).toBeCloseTo(expected.minY)
    expect(bounds.maxY).toBeCloseTo(expected.maxY)
  })
}
