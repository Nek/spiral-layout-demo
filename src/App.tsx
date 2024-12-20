import { createSignal, createMemo, onMount, For, onCleanup } from 'solid-js'
import { placeBox } from './Layout'
import { BoundingBox, Direction, Layout, type Box } from './Layout/types'

const DEMO_BOXES: Partial<Box>[] = [
  { size: [100, 100] },
  { size: [150, 80] },
  { size: [120, 90] },
  { size: [80, 130] },
  { size: [110, 110] },
  { size: [50, 50] },
  { size: [75, 35] },
  { size: [20, 20] },
  { size: [200, 20] },
  { size: [20, 200] },
]

export function App() {
  const [layout, setLayout] = createSignal<Layout>({
    placedBoxes: [],
    availableSpaces: new Map(),
  })
  const [bounds, setBounds] = createSignal<BoundingBox>([[0, 0], [0, 0]])
  const [lastDir, setLastDir] = createSignal(Direction.Right)
  const [zoom, setZoom] = createSignal(1)

  const size = createMemo(() => {
    const currentBounds = bounds()
    return [
      currentBounds[1][0] - currentBounds[0][0],
      currentBounds[1][1] - currentBounds[0][1]
    ]
  })

  const addBox = () => {
    const box = DEMO_BOXES[Math.floor(Math.random() * DEMO_BOXES.length)]
    const { lastDir: newLastDir, layout: newLayout, bounds: newBounds } = placeBox(
      box as Box,
      layout(),
      lastDir(),
      bounds() as BoundingBox
    )
    setLayout(newLayout)
    setLastDir(newLastDir)
    setBounds(newBounds)
  }

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(z => Math.max(0.0001, Math.min(3, z * delta)))
  }

  onMount(() => {
    document.addEventListener('click', addBox)
    document.addEventListener('wheel', handleWheel, { passive: false })
    const interval = setInterval(addBox, 1000)

    onCleanup(() => {
      document.removeEventListener('click', addBox)
      document.removeEventListener('wheel', handleWheel)
      clearInterval(interval)
    })
  })

  return (
    <div class="p-2 left-1/2 top-1/2 absolute transition-all duration-750 ease-in-out">
      <div 
        class="relative m-auto mt-2 mb-2 select-none -translate-x-1/2 -translate-y-1/2 transition-all duration-750 ease-in-out"
        style={{
          width: `${size()[0]}px`,
          height: `${size()[1]}px`,
          transform: `translate(-50%, -50%) scale(${zoom()})`
        }}
      >
        <For each={layout().placedBoxes}>
          {(box, index) => (
            <div
              class="absolute flex items-center justify-center text-white font-bold text-lg font-sans transition-all duration-750 ease-in-out"
              style={{
                left: `${box.position[0] - bounds()[0][0]}px`,
                top: `${box.position[1] - bounds()[0][1]}px`,
                width: `${box.size[0]}px`,
                height: `${box.size[1]}px`,
                background: `hsl(${index() * 60}, 70%, 60%)`
              }}
            >
              {index()}
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
