export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />
}

export function SkeletonOrderCard() {
  return (
    <div className="card border-l-2 border-hops-border space-y-3">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-40" />
        </div>
        <div className="space-y-2 text-right">
          <Skeleton className="h-5 w-20 ml-auto" />
          <Skeleton className="h-4 w-16 ml-auto" />
        </div>
      </div>
      <div className="flex justify-between items-center pt-1">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-7 w-24" />
      </div>
    </div>
  )
}

export function SkeletonCustomerCard() {
  return (
    <div className="card space-y-2">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-3 w-48" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

export function SkeletonStatCard() {
  return (
    <div className="card text-center space-y-2 py-6">
      <Skeleton className="h-10 w-16 mx-auto" />
      <Skeleton className="h-3 w-24 mx-auto" />
    </div>
  )
}
