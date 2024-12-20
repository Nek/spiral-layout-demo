import { useEffect, useRef, useState } from 'preact/hooks'
import placeAllBoxes from './Layout'
import type { Box } from './Layout/types'

const DEMO_BOXES: Box[] = [
  { id: '1', size: [100, 100] },
  { id: '2', size: [150, 80] },
  { id: '3', size: [120, 90] },
  { id: '4', size: [80, 130] },
  { id: '5', size: [110, 110] },
]

export function App() {
  const [boxes, setBoxes] = useState<Box[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setBoxes(prev => {
        if (prev.length >= DEMO_BOXES.length) return prev
        return [...prev, DEMO_BOXES[prev.length]]
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const [layout, bounds] = placeAllBoxes(boxes)

  const [width, height] = [
    bounds[1][0] - bounds[0][0],
    bounds[1][1] - bounds[0][1]
  ]

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Spiral Layout Demo</h1>
      <div 
        ref={containerRef}
        style={{ 
          position: 'relative',
          width: `${width}px`,
          height: `${height}px`,
          margin: '2rem auto'
        }}
      >
        {layout.map(box => (
          <div
            key={box.id}
            style={{
              position: 'absolute',
              left: `${box.position[0] - bounds[0][0]}px`,
              top: `${box.position[1] - bounds[0][1]}px`,
              width: `${box.size[0]}px`,
              height: `${box.size[1]}px`,
              background: `hsl(${parseInt(box.id) * 60}, 70%, 60%)`,
              border: '2px solid white',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            {box.id}
          </div>
        ))}
      </div>
    </div>
  )
}
