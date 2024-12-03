import { Metadata } from 'next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LogSearch } from '@/components/logs/LogSearch'
import { LogAnalytics } from '@/components/logs/LogAnalytics'
import { LogStream } from '@/components/logs/LogStream'

export const metadata: Metadata = {
  title: 'Logs | ManyFlow',
  description: 'Search and analyze logs across your DAGs and tasks.',
}

export default function LogsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Logs</h2>
      </div>
      <Tabs defaultValue="search" className="space-y-4">
        <TabsList>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="stream">Live Stream</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="search" className="border-border bg-background rounded-lg border shadow-sm">
          <LogSearch />
        </TabsContent>
        <TabsContent value="stream" className="border-border bg-background rounded-lg border shadow-sm">
          <div className="p-4">
            <LogStream />
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="border-border bg-background rounded-lg border shadow-sm">
          <LogAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  )
}
