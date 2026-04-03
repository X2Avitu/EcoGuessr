"use client"

import { useEffect, useRef } from "react"

export function GradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      const { width, height } = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Create gradient colors
    const colors = [
      { r: 255, g: 0, b: 128 }, // Pink
      { r: 255, g: 102, b: 0 }, // Orange
      { r: 153, g: 51, b: 255 }, // Purple
      { r: 0, g: 204, b: 255 }, // Cyan
    ]

    // Create blobs distributed across the entire page
    const blobs: any[] = []

    // Create blobs for the top section
    for (let i = 0; i < 4; i++) {
      blobs.push({
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height * 0.5), // Top half
        radius: 150 + Math.random() * 250,
        xSpeed: (Math.random() - 0.5) * 0.8, // Faster movement
        ySpeed: (Math.random() - 0.5) * 0.8,
        colorIndex: i % colors.length,
      })
    }

    // Create blobs for the middle and bottom sections
    for (let i = 0; i < 6; i++) {
      blobs.push({
        x: Math.random() * canvas.width,
        y: canvas.height * 0.5 + Math.random() * (canvas.height * 0.5), // Bottom half
        radius: 150 + Math.random() * 250,
        xSpeed: (Math.random() - 0.5) * 0.8,
        ySpeed: (Math.random() - 0.5) * 0.8,
        colorIndex: i % colors.length,
      })
    }

    // Animation
    let animationFrameId: number
    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw and update blobs
      blobs.forEach((blob) => {
        // Update position
        blob.x += blob.xSpeed
        blob.y += blob.ySpeed

        // Bounce off edges with some buffer
        const buffer = blob.radius * 0.5
        if (blob.x < -buffer) {
          blob.x = -buffer
          blob.xSpeed *= -1
        } else if (blob.x > canvas.width + buffer) {
          blob.x = canvas.width + buffer
          blob.xSpeed *= -1
        }

        if (blob.y < -buffer) {
          blob.y = -buffer
          blob.ySpeed *= -1
        } else if (blob.y > canvas.height + buffer) {
          blob.y = canvas.height + buffer
          blob.ySpeed *= -1
        }

        // Draw gradient blob with higher opacity
        const color = colors[blob.colorIndex]
        const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius)

        // Much higher base opacity (0.4 at center)
        gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.4)`)
        // Sharper falloff (0.1 at 70% radius)
        gradient.addColorStop(0.7, `rgba(${color.r}, ${color.g}, ${color.b}, 0.1)`)
        gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`)

        ctx.beginPath()
        ctx.fillStyle = gradient
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrameId = window.requestAnimationFrame(render)
    }

    render()

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
