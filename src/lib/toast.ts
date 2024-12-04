import { toast } from 'sonner'

export const showToast = {
  success: (message: string) => {
    toast.success(message)
  },
  error: (message: string, error?: Error) => {
    toast.error(message, {
      description: error?.message,
    })
  },
  loading: (message: string) => {
    return toast.loading(message)
  },
  promise: async <T>(
    promise: Promise<T>,
    {
      loading = 'Loading...',
      success = 'Success!',
      error = 'Something went wrong',
    }: {
      loading?: string
      success?: string
      error?: string
    } = {}
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    })
  },
}
