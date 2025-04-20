"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeSwitcher() {
  const { setTheme } = useTheme()

  return (
    <div className="flex gap-2">
      <Button className="hover:cursor-pointer" variant="ghost" size="icon" onClick={() => setTheme("light")}>
        <Sun className="h-5 w-5" />
      </Button>
      <Button className="hover:cursor-pointer" variant="ghost" size="icon" onClick={() => setTheme("dark")}>
        <Moon className="h-5 w-5" />
      </Button>
      <Button className="hover:cursor-pointer" variant="ghost" size="icon" onClick={() => setTheme("system")}>
        <Monitor className="h-5 w-5" />
      </Button>
    </div>
  )
} 