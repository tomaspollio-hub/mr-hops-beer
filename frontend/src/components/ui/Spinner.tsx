import { cn } from '@/lib/utils'

export default function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('w-6 h-6 border-2 border-hops-green border-t-transparent rounded-full animate-spin', className)} />
  )
}
