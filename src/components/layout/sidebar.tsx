"use client"

import { Box, Flex, Heading } from '@radix-ui/themes'
import { ThemeToggle } from '@/components/theme-toggle'
import { Navigation } from '@/components/layout/navigation'
import { ThemeProvider } from '@/components/providers/theme-provider'

export const Sidebar = () => {
  return (
    <ThemeProvider>
      <Box className="hidden border-r md:block md:w-64">
        <Flex direction="column" style={{ height: '100vh' }}>
          <Flex justify="between" align="center" p="4" className="border-b">
            <Heading size="4">ManyFlow</Heading>
            <ThemeToggle />
          </Flex>
          <Box className="flex-1 overflow-auto p-4">
            <Navigation />
          </Box>
        </Flex>
      </Box>
    </ThemeProvider>
  )
}
