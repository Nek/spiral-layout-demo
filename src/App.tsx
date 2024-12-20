import { createSignal, createMemo, onMount, For } from 'solid-js'
import { placeBox } from './Layout'
import { BoundingBox, Direction, type Box, type PlacedBox } from './Layout/types'

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
  const [layout, setLayout] = createSignal<PlacedBox[]>([])
  const [bounds, setBounds] = createSignal<BoundingBox>([[0, 0], [0, 0]])
  const [lastDir, setLastDir] = createSignal(Direction.Right)
  const [maxScrollTop, setMaxScrollTop] = createSignal(0)
  const [maxScrollLeft, setMaxScrollLeft] = createSignal(0)

  const size = createMemo(() => {
    const currentBounds = bounds()
    return [
      currentBounds[1][0] - currentBounds[0][0],
      currentBounds[1][1] - currentBounds[0][1]
    ]
  })

  const addBox = () => {
    const box = DEMO_BOXES[Math.floor(Math.random() * DEMO_BOXES.length)]
    box.id = layout().length.toString()
    const { lastDir: newLastDir, placedBox, bounds: newBounds } = placeBox(
      box as Box,
      layout(),
      lastDir(),
      bounds() as BoundingBox
    )
    setLayout([...layout(), placedBox])
    setLastDir(newLastDir)
    setBounds(newBounds)
  }

  onMount(() => {
    document.addEventListener('click', addBox)
    const interval = setInterval(addBox, 1000)
    return () => {
      document.removeEventListener('click', addBox)
      clearInterval(interval)
    }
  })

  return (
    <div class="p-2 left-1/2 top-1/2 absolute scroll-none">
      <div 
        class="relative m-auto mt-2 mb-2 select-none -translate-x-1/2 -translate-y-1/2"
        style={{
          width: `${size()[0]}px`,
          height: `${size()[1]}px`
        }}
      >
        <For each={layout()}>
          {(box) => (
            <div
              class="absolute flex items-center justify-center text-white font-bold text-lg font-sans transition-all duration-750 ease-in-out"
              style={{
                left: `${box.position[0] - bounds()[0][0]}px`,
                top: `${box.position[1] - bounds()[0][1]}px`,
                width: `${box.size[0]}px`,
                height: `${box.size[1]}px`,
                background: `hsl(${parseInt(box.id) * 60}, 70%, 60%)`
              }}
            >
              {box.id}
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
