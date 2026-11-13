import { expect, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "lib"

// A fabrication-note dimension between two mounting holes. Its arrowheads sit
// on the hole centers, so they must be drawn after (above) the drills like
// every other fabrication note; otherwise the drill circles hide them.
const circuitJson: AnyCircuitElement[] = [
  {
    type: "pcb_board",
    pcb_board_id: "board",
    center: { x: 0, y: 0 },
    width: 20,
    height: 10,
    thickness: 1.6,
    num_layers: 2,
    material: "fr4",
  } as AnyCircuitElement,
  {
    type: "pcb_hole",
    pcb_hole_id: "hole_left",
    hole_shape: "circle",
    hole_diameter: 3,
    x: -6,
    y: 0,
  } as AnyCircuitElement,
  {
    type: "pcb_hole",
    pcb_hole_id: "hole_right",
    hole_shape: "circle",
    hole_diameter: 3,
    x: 6,
    y: 0,
  } as AnyCircuitElement,
  {
    type: "pcb_fabrication_note_dimension",
    pcb_fabrication_note_dimension_id: "dim",
    pcb_component_id: "comp",
    layer: "top",
    from: { x: -6, y: 0 },
    to: { x: 6, y: 0 },
    text: "12mm",
    font_size: 1,
    arrow_size: 1,
  } as AnyCircuitElement,
]

test("fabrication note dimension is drawn above holes like other fabrication notes", () => {
  const svg = convertCircuitJsonToPcbSvg(circuitJson)

  const dimensionIndex = svg.indexOf(
    'data-type="pcb_fabrication_note_dimension"',
  )
  const lastHoleIndex = svg.lastIndexOf('data-type="pcb_hole"')

  expect(dimensionIndex).toBeGreaterThan(-1)
  expect(lastHoleIndex).toBeGreaterThan(-1)
  expect(dimensionIndex).toBeGreaterThan(lastHoleIndex)
  expect(svg).toContain(
    'data-type="pcb_fabrication_note_dimension" data-pcb-fabrication-note-dimension-id="dim" data-pcb-layer="overlay"',
  )
})
