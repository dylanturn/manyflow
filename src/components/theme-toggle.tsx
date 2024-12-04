"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTheme } from "@/components/providers/theme-provider"

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false)
  // const { theme, setTheme } = useTheme()
  // const isDark = theme === 'dark'

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        color="gray"
        aria-label="Toggle theme"
        disabled
      >
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    )
  }

  // const toggleTheme = () => {
  //   setTheme(isDark ? 'light' : 'dark')
  // }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          
        </TooltipTrigger>
        <TooltipContent>
          
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
