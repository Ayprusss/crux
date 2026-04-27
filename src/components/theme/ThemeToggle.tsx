"use client"

import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "./ThemeProvider"

export function ThemeToggle() {
  const { theme, toggle } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className="relative rounded-full"
    >
      <span
        className={`absolute transition-all duration-300 ${
          theme === "dark" ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-75"
        }`}
      >
        <Sun className="size-4" />
      </span>
      <span
        className={`absolute transition-all duration-300 ${
          theme === "light" ? "rotate-0 opacity-100 scale-100" : "rotate-90 opacity-0 scale-75"
        }`}
      >
        <Moon className="size-4" />
      </span>
    </Button>
  )
}
