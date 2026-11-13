import { expect, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import { convertCircuitJsonToSchematicSvg } from "lib/index"
import { colorMap as defaultColorMap } from "lib/utils/colors"

const circuitJson: AnyCircuitElement[] = [
  {
    type: "source_component",
    source_component_id: "source_component_1",
    name: "U1",
    ftype: "simple_chip",
  },
  {
    type: "source_port",
    source_port_id: "source_port_1",
    name: "pin1",
    pin_number: 1,
    source_component_id: "source_component_1",
  },
  {
    type: "schematic_component",
    schematic_component_id: "schematic_component_1",
    source_component_id: "source_component_1",
    center: { x: 0, y: 0 },
    size: { width: 1, height: 1 },
    port_labels: { "1": "IN" },
  } as any,
  {
    type: "schematic_port",
    schematic_port_id: "schematic_port_1",
    source_port_id: "source_port_1",
    schematic_component_id: "schematic_component_1",
    center: { x: -0.9, y: 0 },
    side_of_component: "left",
    distance_from_component_edge: 0.4,
    pin_number: 1,
    has_input_arrow: true,
  } as any,
]

test("schematic colorOverrides apply to grid, labeled points and box pins", () => {
  const overrides = {
    grid: "rgb(1, 2, 3)",
    component_outline: "rgb(4, 5, 6)",
    pin_number: "rgb(7, 8, 9)",
  }
  const svg = convertCircuitJsonToSchematicSvg(circuitJson, {
    grid: { cellSize: 1, labelCells: true },
    labeledPoints: [{ x: 0, y: 0, label: "origin" }],
    colorOverrides: { schematic: overrides },
  })

  // grid lines/labels and labeled points
  expect(svg).toContain(`stroke="${overrides.grid}"`)
  expect(svg).toContain(`fill="${overrides.grid}"`)
  expect(svg).not.toContain(defaultColorMap.schematic.grid)

  // port input arrow outline
  const arrow = svg.match(/<polygon [^>]*>/)![0]
  expect(arrow).toContain(`stroke="${overrides.component_outline}"`)

  // pin number and pin label text
  for (const cls of ["sch-pin-number", "sch-pin-label"]) {
    const text = svg.match(new RegExp(`<text class="[^"]*${cls}"[^>]*>`))![0]
    expect(text).toContain(`fill="${overrides.pin_number}"`)
  }

  expect(svg).not.toContain(defaultColorMap.schematic.component_outline)
  expect(svg).not.toContain(defaultColorMap.schematic.pin_number)
})
