"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import * as topojson from "topojson-client"

interface RotatingEarthProps {
  width?: number
  height?: number
  className?: string
}

export default function RotatingEarth({ width = 1000, height = 1000, className = "" }: RotatingEarthProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    if (!context) return

    // Get actual container size for responsive behavior
    const container = canvas.parentElement
    const containerRect = container?.getBoundingClientRect()
    const containerWidth = containerRect?.width || width
    const containerHeight = containerRect?.height || height
    const size = Math.min(containerWidth, containerHeight)
    const radius = size / 2.8 // Adjusted for perfect circular proportions

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    context.scale(dpr, dpr)

    // Create projection and path generator for Canvas with tilt and perfect circular shape
    const projection = d3
      .geoOrthographic()
      .scale(radius * 1.3) // Increased scale for more zoom and closer appearance
      .translate([size / 2, size / 2])
      .rotate([0, -15, 10]) // Add moderate tilt: longitude, latitude, roll
      .clipAngle(90)

    const path = d3.geoPath().projection(projection).context(context)

    const pointInPolygon = (point: [number, number], polygon: number[][]): boolean => {
      const [x, y] = point
      let inside = false

      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i]
        const [xj, yj] = polygon[j]

        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
          inside = !inside
        }
      }

      return inside
    }

    const pointInFeature = (point: [number, number], feature: any): boolean => {
      const geometry = feature.geometry

      if (geometry.type === "Polygon") {
        const coordinates = geometry.coordinates
        // Check if point is in outer ring
        if (!pointInPolygon(point, coordinates[0])) {
          return false
        }
        // Check if point is in any hole (inner rings)
        for (let i = 1; i < coordinates.length; i++) {
          if (pointInPolygon(point, coordinates[i])) {
            return false // Point is in a hole
          }
        }
        return true
      } else if (geometry.type === "MultiPolygon") {
        // Check each polygon in the MultiPolygon
        for (const polygon of geometry.coordinates) {
          // Check if point is in outer ring
          if (pointInPolygon(point, polygon[0])) {
            // Check if point is in any hole
            let inHole = false
            for (let i = 1; i < polygon.length; i++) {
              if (pointInPolygon(point, polygon[i])) {
                inHole = true
                break
              }
            }
            if (!inHole) {
              return true
            }
          }
        }
        return false
      }

      return false
    }

    const generateDotsInPolygon = (feature: any, dotSpacing = 20) => { // Increased spacing to reduce dots
      const dots: [number, number][] = []
      const bounds = d3.geoBounds(feature)
      const [[minLng, minLat], [maxLng, maxLat]] = bounds

      const stepSize = dotSpacing * 0.1 // Increased step size for better performance
      let pointsGenerated = 0

      for (let lng = minLng; lng <= maxLng; lng += stepSize) {
        for (let lat = minLat; lat <= maxLat; lat += stepSize) {
          const point: [number, number] = [lng, lat]
          if (pointInFeature(point, feature)) {
            dots.push(point)
            pointsGenerated++
          }
        }
      }

      return dots // Removed console.log for better performance
    }

    // Function to check if a country is one of the target countries
    const isTargetCountry = (countryName: string): boolean => {
      if (!countryName || typeof countryName !== 'string') {
        return false
      }
      
      const normalizedName = countryName.toLowerCase().trim()
      
      // Only Brazil and United States should be red - very strict matching
      const targetCountries = [
        'brazil',
        'brasil', 
        'united states',
        'united states of america',
        'usa',
        'us'
      ]
      
      return targetCountries.includes(normalizedName)
    }

    interface DotData {
      lng: number
      lat: number
      visible: boolean
      opacity: number
      country: string
      isTarget: boolean
    }

    interface BlinkingDot {
      lng: number
      lat: number
      country: string
      opacity: number
    }

    const allDots: DotData[] = []
    let landFeatures: any

    const render = () => {
      // Clear canvas
      context.clearRect(0, 0, size, size)

      const currentScale = projection.scale()
      const scaleFactor = currentScale / radius

      // Remove globe outline - no white border around the globe

      if (landFeatures) {
        // Draw graticule with optimized rendering
        const graticule = d3.geoGraticule()
        context.beginPath()
        path(graticule())
        context.strokeStyle = "#ffffff"
        context.lineWidth = 1 * scaleFactor
        context.globalAlpha = 0.25
        context.stroke()
        context.globalAlpha = 1

        // Remove land outlines - no white borders around continents

        // Optimized halftone dots rendering with different colors for target countries
        const dotRadius = 1.2 * scaleFactor
        
        // Count dots by type for debugging
        let redDotsRendered = 0
        let whiteDotsRendered = 0
        
        // Render dots with different colors based on country
        allDots.forEach((dot) => {
          const projected = projection([dot.lng, dot.lat])
          if (
            projected &&
            projected[0] >= -dotRadius &&
            projected[0] <= size + dotRadius &&
            projected[1] >= -dotRadius &&
            projected[1] <= size + dotRadius
          ) {
            if (dot.isTarget) {
              // Red color for target countries (Brazil, United States) - static, no blinking
              context.fillStyle = `rgba(233, 21, 45, 0.8)`
              redDotsRendered++
            } else {
              // White color for all other countries
              context.fillStyle = `rgba(255, 255, 255, 0.6)`
              whiteDotsRendered++
            }
            context.beginPath()
            context.arc(projected[0], projected[1], dotRadius, 0, 2 * Math.PI)
            context.fill()
          }
        })
        
        // Log rendering statistics every 100 frames to avoid spam
        if (Math.random() < 0.01) { // ~1% chance per frame
          console.log(`🎨 Rendered: ${redDotsRendered} RED dots, ${whiteDotsRendered} WHITE dots`)
        }

        // No additional blinking dots - removed all blinking animations
      }
    }

    const loadWorldData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Try multiple reliable data sources
        const dataSources = [
          "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
          "https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json",
          "https://unpkg.com/world-atlas@2/land-110m.json"
        ]

        let world = null
        let lastError = null

        for (const dataSource of dataSources) {
          try {
            console.log(`Trying to load data from: ${dataSource}`)
            const response = await fetch(dataSource)
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()
            
            // Handle different data formats
            if (dataSource.includes('.geojson')) {
              // Direct GeoJSON format
              landFeatures = data
            } else {
              // TopoJSON format
              world = data
              landFeatures = topojson.feature(world, world.objects.land)
            }
            
            console.log('Successfully loaded world data')
            break
          } catch (err) {
            lastError = err
            console.warn(`Failed to load from ${dataSource}:`, err)
            continue
          }
        }

        if (!landFeatures) {
          throw lastError || new Error("All data sources failed")
        }

        // Generate dots for all land features with optimized spacing
        if (landFeatures.features) {
          landFeatures.features.forEach((feature: any) => {
            const countryName = feature.properties?.NAME || feature.properties?.name || feature.properties?.NAME_EN || 'Unknown'
            const isTarget = isTargetCountry(countryName)
            const dots = generateDotsInPolygon(feature, 20)
            
            dots.forEach(([lng, lat]) => {
              allDots.push({ 
                lng, 
                lat, 
                visible: true, 
                opacity: 0.8,
                country: countryName,
                isTarget: isTarget
              })
            })
          })
        }

        render()
        setIsLoading(false)
      } catch (err) {
        console.error('Error loading world data:', err)
        setError(`Failed to load geographic data: ${err instanceof Error ? err.message : 'Unknown error'}`)
        setIsLoading(false)
      }
    }

    // Set up rotation and interaction with tilt preserved
    const rotation = [0, -15, 10] // Start with the same tilt as initial projection
    let autoRotate = true
    const rotationSpeed = 0.08 // Slightly slower for smoother performance
    let animationId: number
    let blinkTime = 0

    // Removed blinking animation - all dots now have static colors

    const rotate = () => {
      if (autoRotate) {
        rotation[0] += rotationSpeed
        // Keep the tilt angles constant during auto-rotation
        projection.rotate([rotation[0], -15, 10])
      }
      render()
      animationId = requestAnimationFrame(rotate)
    }

    // Start animation with requestAnimationFrame for better performance
    animationId = requestAnimationFrame(rotate)

    const handleMouseDown = (event: MouseEvent) => {
      autoRotate = false
      const startX = event.clientX
      const startY = event.clientY
      const startRotation = [...rotation]

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const sensitivity = 0.5
        const dx = moveEvent.clientX - startX
        // Restrict movement to horizontal axis only
        rotation[0] = startRotation[0] + dx * sensitivity
        // Keep the tilt angles constant during manual rotation
        rotation[1] = -15
        rotation[2] = 10

        projection.rotate([rotation[0], -15, 10])
        render()
      }

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)

        setTimeout(() => {
          autoRotate = true
        }, 10)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    // Touch event handlers for mobile interaction
    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault()
      autoRotate = false
      const touch = event.touches[0]
      const startX = touch.clientX
      const startY = touch.clientY
      const startRotation = [...rotation]

      const handleTouchMove = (moveEvent: TouchEvent) => {
        event.preventDefault()
        const touch = moveEvent.touches[0]
        const sensitivity = 0.5
        const dx = touch.clientX - startX
        // Restrict movement to horizontal axis only
        rotation[0] = startRotation[0] + dx * sensitivity
        // Keep the tilt angles constant during manual rotation
        rotation[1] = -15
        rotation[2] = 10

        projection.rotate([rotation[0], -15, 10])
        render()
      }

      const handleTouchEnd = () => {
        document.removeEventListener("touchmove", handleTouchMove)
        document.removeEventListener("touchend", handleTouchEnd)

        setTimeout(() => {
          autoRotate = true
        }, 10)
      }

      document.addEventListener("touchmove", handleTouchMove, { passive: false })
      document.addEventListener("touchend", handleTouchEnd)
    }

    // Add both mouse and touch event listeners
    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false })

    // Handle resize
    const handleResize = () => {
      const container = canvas.parentElement
      const containerRect = container?.getBoundingClientRect()
      const newContainerWidth = containerRect?.width || width
      const newContainerHeight = containerRect?.height || height
      const newSize = Math.min(newContainerWidth, newContainerHeight)
      const newRadius = newSize / 2.8

      const dpr = window.devicePixelRatio || 1
      canvas.width = newSize * dpr
      canvas.height = newSize * dpr
      canvas.style.width = `${newSize}px`
      canvas.style.height = `${newSize}px`
      context.scale(dpr, dpr)

      projection
        .scale(newRadius * 1.3)
        .translate([newSize / 2, newSize / 2])
    }

    window.addEventListener('resize', handleResize)

    // Load the world data
    loadWorldData()

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId)
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener('resize', handleResize)
    }
  }, [width, height])

  return (
    <div className={`relative w-full h-full ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent">
          <div className="text-white text-sm">Loading Earth...</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent">
          <div className="text-red-400 text-sm text-center px-4">
            Error loading Earth visualization<br />
            <span className="text-xs">{error}</span>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="block max-w-full max-h-full"
        style={{
          background: 'transparent',
          borderRadius: '50%',
        }}
      />
    </div>
  )
}