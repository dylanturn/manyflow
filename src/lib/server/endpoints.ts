import { kv } from '@vercel/kv'
import { Endpoint } from '@/contexts/endpoints-context'

const ENDPOINTS_KEY = 'airflow:endpoints'

export async function getEndpoints(): Promise<Endpoint[]> {
  try {
    const endpoints = await kv.get<Endpoint[]>(ENDPOINTS_KEY)
    return endpoints || []
  } catch (error) {
    console.error('Failed to get endpoints:', error)
    return []
  }
}

export async function getEndpoint(id: string): Promise<Endpoint | undefined> {
  const endpoints = await getEndpoints()
  return endpoints.find((e) => e.id === id)
}

export async function addEndpoint(endpoint: Omit<Endpoint, 'id' | 'isActive'>): Promise<Endpoint> {
  const endpoints = await getEndpoints()
  const newEndpoint: Endpoint = {
    ...endpoint,
    id: crypto.randomUUID(),
    isActive: true,
  }
  
  await kv.set(ENDPOINTS_KEY, [...endpoints, newEndpoint])
  return newEndpoint
}

export async function updateEndpoint(id: string, update: Partial<Endpoint>): Promise<void> {
  const endpoints = await getEndpoints()
  const updatedEndpoints = endpoints.map((endpoint) =>
    endpoint.id === id ? { ...endpoint, ...update } : endpoint
  )
  
  await kv.set(ENDPOINTS_KEY, updatedEndpoints)
}

export async function deleteEndpoint(id: string): Promise<void> {
  const endpoints = await getEndpoints()
  const filteredEndpoints = endpoints.filter((endpoint) => endpoint.id !== id)
  
  await kv.set(ENDPOINTS_KEY, filteredEndpoints)
}
