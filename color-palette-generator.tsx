"use client"

import { useState } from "react"
import { HexColorPicker } from "react-colorful"
import { colord, extend } from "colord"
import harmoniesPlugin from "colord/plugins/harmonies"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

extend([harmoniesPlugin])

type ColorPalette = {
  name: string
  colors: string[]
}

export default function ColorPaletteGenerator() {
  const [selectedColor, setSelectedColor] = useState("#000000")
  const [palettes, setPalettes] = useState<ColorPalette[]>([])

  const generatePalettes = () => {
    const color = colord(selectedColor)

    const newPalettes: ColorPalette[] = [
      {
        name: "Complementary",
        colors: [color.toHex(), color.complement().toHex()],
      },
      {
        name: "Analogous",
        colors: color.analogous().map((c) => c.toHex()),
      },
      {
        name: "Triadic",
        colors: color.triad().map((c) => c.toHex()),
      },
      {
        name: "Tetradic",
        colors: color.tetrad().map((c) => c.toHex()),
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
            <CardContent>
              <HexColorPicker color={selectedColor} onChange={setSelectedColor} />
              <p className="mt-4 text-center font-semibold">{selectedColor}</p>
              <Button className="w-full mt-4" onClick={generatePalettes}>
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
                  <div className="flex flex-wrap gap-2">
                    {palette.colors.map((color, colorIndex) => (
                      <div
                        key={colorIndex}
                        className="w-12 h-12 rounded-full border border-gray-300"
                        style={{ backgroundColor: color }}
                        title={color}
                      ></div>
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

