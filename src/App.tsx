import { placeBox } from './Layout'
import { BoundingBox, Direction, type Box, type PlacedBox } from './Layout/types'
import { computed, signal } from "@preact/signals"

const layout = signal<PlacedBox[]>([])
const bounds = signal<BoundingBox>([[0, 0], [0, 0]])
const lastDir = signal(Direction.Right)

const size = computed(() => {
  return [
    bounds.value[1][0] - bounds.value[0][0],
    bounds.value[1][1] - bounds.value[0][1]
  ]
});

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

const addBox = () => {
  const box = DEMO_BOXES[Math.floor(Math.random() * DEMO_BOXES.length)]
  box.id = (layout.value.length).toString()
  const { lastDir: newLastDir, placedBox, bounds: newBounds } = placeBox(box as Box, layout.value, lastDir.value, bounds.value as BoundingBox)
  layout.value = [...layout.value, placedBox]
  lastDir.value = newLastDir
  bounds.value = newBounds
}

document.addEventListener('click', () => {
  addBox()
})

setInterval(() => {
  addBox()
}, 1000)

export function App() {

  return (
    <div style={{ padding: '2rem' }}>
      <div 
        className={'relative m-auto mt-2 mb-2 ' + `w-[${size.value[0]}px] h-[${size.value[1]}px] `}
      >
        {layout.value.map(box => {
          return (
            <div
              key={box.id}
              className="absolute flex items-center justify-center text-white font-bold text-lg font-sans transition-all duration-750 ease-in-out"
              style={{
                left: `${box.position[0] - bounds.value[0][0]}px`,
                top: `${box.position[1] - bounds.value[0][1]}px`,
                width: `${box.size[0]}px`,
                height: `${box.size[1]}px`,
                background: `hsl(${parseInt(box.id) * 60}, 70%, 60%)`,
              }}
            >
              {box.id}
            </div>
          )
        })}
      </div>
    </div>
  )
}
