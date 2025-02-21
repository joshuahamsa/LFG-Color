"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { HexColorPicker } from "react-colorful"
import { colord, extend } from "colord"
import harmoniesPlugin from "colord/plugins/harmonies"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

extend([harmoniesPlugin])

type ColorPalette = {
  name: string
  colors: string[]
}

export default function ColorPaletteGenerator() {
  const [selectedColor, setSelectedColor] = useState("#000000")
  const [hexInput, setHexInput] = useState("#000000")
  const [palettes, setPalettes] = useState<ColorPalette[]>([])
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [imagePalette, setImagePalette] = useState<string[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    setHexInput(selectedColor)
  }, [selectedColor])

  useEffect(() => {
    if (uploadedImage) {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        const canvas = canvasRef.current
        if (canvas) {
          const ctx = canvas.getContext("2d")
          if (ctx) {
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0, img.width, img.height)
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const colors = extractColors(imageData.data, 6)
            setImagePalette(colors)
          }
        }
      }
      img.src = uploadedImage
    }
  }, [uploadedImage])

  const extractColors = (imageData: Uint8ClampedArray, colorCount: number): string[] => {
    const colorMap: { [key: string]: number } = {}
    for (let i = 0; i < imageData.length; i += 4) {
      const r = imageData[i]
      const g = imageData[i + 1]
      const b = imageData[i + 2]
      const rgb = `${r},${g},${b}`
      colorMap[rgb] = (colorMap[rgb] || 0) + 1
    }
    return Object.entries(colorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, colorCount)
      .map(([rgb]) => {
        const [r, g, b] = rgb.split(",").map(Number)
        return colord({ r, g, b }).toHex()
      })
  }

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value
    setHexInput(newHex)
    if (newHex.match(/^#[0-9A-Fa-f]{6}$/)) {
      setSelectedColor(newHex)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setUploadedImage(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const generatePalettes = () => {
    const color = colord(selectedColor)

    const newPalettes: ColorPalette[] = [
      {
        name: "Complementary",
        colors: color.harmonies("complementary").map((c) => c.toHex()),
      },
      {
        name: "Analogous",
        colors: color.harmonies("analogous").map((c) => c.toHex()),
      },
      {
        name: "Triadic",
        colors: color.harmonies("triadic").map((c) => c.toHex()),
      },
      {
        name: "Tetradic",
        colors: color.harmonies("tetradic").map((c) => c.toHex()),
      },
      {
        name: "Monochromatic",
        colors: [
          color.lighten(0.4).toHex(),
          color.lighten(0.2).toHex(),
          color.toHex(),
          color.darken(0.2).toHex(),
          color.darken(0.4).toHex(),
        ],
      },
    ]

    setPalettes(newPalettes)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Color Palette Generator</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Select a Color</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <HexColorPicker color={selectedColor} onChange={setSelectedColor} />
              <Input
                type="text"
                value={hexInput}
                onChange={handleHexChange}
                placeholder="#000000"
                className="font-mono"
              />
              <Input type="file" accept="image/*" onChange={handleImageUpload} />
              {uploadedImage && (
                <>
                  <img src={uploadedImage || "/placeholder.svg"} alt="Uploaded image" className="max-w-full" />
                  <canvas ref={canvasRef} style={{ display: "none" }} />
                  <div className="grid grid-cols-3 gap-2">
                    {imagePalette.map((color, index) => (
                      <div key={index} className="text-center">
                        <div
                          className="w-full h-12 border border-gray-300"
                          style={{ backgroundColor: color }}
                          onClick={() => setSelectedColor(color)}
                        ></div>
                        <span className="text-xs font-mono">{color}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <Button className="w-full" onClick={generatePalettes}>
                Generate Palettes
              </Button>
            </CardContent>
          </Card>
        </div>
        <div className="w-full md:w-2/3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {palettes.map((palette, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{palette.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2">
                    {palette.colors.map((color, colorIndex) => (
                      <div key={colorIndex} className="flex items-center">
                        <div className="w-12 h-12 border border-gray-300" style={{ backgroundColor: color }}></div>
                        <span className="ml-4 font-mono">{color.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

