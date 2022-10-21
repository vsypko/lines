import { useLayoutEffect, useRef } from "react"
import DrawLine from "services/drawLine"

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useLayoutEffect(() => {
    if (canvasRef.current) {
      new DrawLine(canvasRef.current)
    }
  })

  return <canvas ref={canvasRef} className="canvas" />
}
