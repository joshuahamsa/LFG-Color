"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { HexColorPicker } from "react-colorful"
import { colord, extend } from "colord"
import harmoniesPlugin from "colord/plugins/harmonies"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

extend([harmoniesPlugin])

type ColorPalette = {
  name: string
  colors: string[]
}

export default function ColorPaletteGenerator() {
  const [selectedColor, setSelectedColor] = useState("#6366F1")
  const [hexInput, setHexInput] = useState("#6366F1")
  const [palettes, setPalettes] = useState<ColorPalette[]>([])
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [imagePalette, setImagePalette] = useState<string[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    setHexInput(selectedColor)
    generatePalettes()
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
        LFG Color Palette Generator
      </h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <Card className="w-full lg:w-1/3 bg-gray-800 border-gray-700">
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-center">
              <HexColorPicker color={selectedColor} onChange={setSelectedColor} />
            </div>
            <Input
              type="text"
              value={hexInput}
              onChange={handleHexChange}
              placeholder="#000000"
              className="font-mono bg-gray-700 border-gray-600 text-white"
            />
            <div className="relative">
              <Input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
              <label
                htmlFor="image-upload"
                className="block w-full py-2 px-4 text-center bg-gradient-to-r from-purple-500 to-pink-500 rounded-md cursor-pointer hover:from-purple-600 hover:to-pink-600 transition-colors"
              >
                Upload Image
              </label>
            </div>
            {uploadedImage && (
              <>
                <img src={uploadedImage || "/placeholder.svg"} alt="Uploaded image" className="max-w-full rounded-md" />
                <canvas ref={canvasRef} style={{ display: "none" }} />
                <div className="grid grid-cols-3 gap-2">
                  {imagePalette.map((color, index) => (
                    <motion.div
                      key={index}
                      className="text-center cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedColor(color)}
                    >
                      <div className="w-full h-12 rounded-md" style={{ backgroundColor: color }}></div>
                      <span className="text-xs font-mono mt-1 block text-white">{color}</span>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
          {palettes.map((palette, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">{palette.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {palette.colors.map((color, colorIndex) => (
                    <motion.div
                      key={colorIndex}
                      className="flex-1 min-w-[100px] text-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="h-20 rounded-md mb-2" style={{ backgroundColor: color }}></div>
                      <span className="text-xs font-mono text-white">{color.toUpperCase()}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

