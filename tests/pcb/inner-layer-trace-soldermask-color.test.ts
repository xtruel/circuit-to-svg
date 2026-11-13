import { expect, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "lib"

const board = {
  type: "pcb_board",
  pcb_board_id: "board",
  center: { x: 0, y: 0 },
  width: 10,
  height: 10,
  num_layers: 4,
  thickness: 1.6,
  material: "fr4",
} as AnyCircuitElement

const innerTrace = (extra: Record<string, unknown> = {}) =>
  ({
    type: "pcb_trace",
    pcb_trace_id: "inner_trace",
    ...extra,
    route: [
      { route_type: "wire", x: -3, y: 0, width: 0.3, layer: "inner1" },
      { route_type: "wire", x: 3, y: 0, width: 0.6, layer: "inner1" },
    ],
  }) as AnyCircuitElement

// colorMap.soldermaskWithCopperUnderneath only has top/bottom entries, so inner
// layer traces got stroke="undefined" (invisible) or fill="undefined" (black).
test("inner-layer trace stroke is a real color when showSolderMask is on", () => {
  const svg = convertCircuitJsonToPcbSvg([board, innerTrace()], {
    showSolderMask: true,
  })
  const trace = svg.match(/<path [^>]*data-pcb-layer="inner1"[^>]*>/)?.[0]
  expect(trace).toBeDefined()
  expect(trace).not.toContain('"undefined"')
  expect(trace).toContain('stroke="rgb(18, 82, 50)"')
})

test("interpolated inner-layer trace fill is a real color when showSolderMask is on", () => {
  const svg = convertCircuitJsonToPcbSvg(
    [board, innerTrace({ route_thickness_mode: "interpolated" })],
    { showSolderMask: true },
  )
  const trace = svg.match(/<path [^>]*data-pcb-layer="inner1"[^>]*>/)?.[0]
  expect(trace).toBeDefined()
  expect(trace).not.toContain('"undefined"')
  expect(trace).toContain('fill="rgb(18, 82, 50)"')
})
