import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function MetricCardSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-[60px] mb-1" />
                <Skeleton className="h-3 w-[140px]" />
            </CardContent>
        </Card>
    )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <div className="h-12 border-b bg-muted/50 px-4 flex items-center">
                    <Skeleton className="h-4 w-full max-w-[800px]" />
                </div>

                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex items-center p-4 border-b last:border-0 gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-4 w-[150px]" />
                        </div>
                        <Skeleton className="h-8 w-[100px]" />
                    </div>
                ))}
            </div>
        </div>
    )
}

export function FilterBarSkeleton() {
    return (
        <div className="flex gap-2 mb-4">
            <Skeleton className="h-9 w-[180px]" />
            <Skeleton className="h-9 w-[120px]" />
            <Skeleton className="h-9 w-[100px]" />
        </div>
    )
}

export function ChartSkeleton() {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <Skeleton className="h-6 w-[140px]" />
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[240px] flex items-end justify-between gap-2 px-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className={`w-full h-[${20 + Math.random() * 60}%] rounded-t-sm`} />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export function CustomerCardSkeleton() {
    return (
        <Card className="p-6">
            <div className="flex justify-between mb-4">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-[140px]" />
                    <Skeleton className="h-4 w-[100px]" />
                </div>
                <div className="flex gap-1">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                </div>
            </div>
            <div className="space-y-2 mb-4">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-[160px]" />
            </div>
            <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between">
                    <Skeleton className="h-4 w-[60px]" />
                    <Skeleton className="h-4 w-[40px]" />
                </div>
                <div className="flex justify-between">
                    <Skeleton className="h-4 w-[60px]" />
                    <Skeleton className="h-4 w-[80px]" />
                </div>
            </div>
        </Card>
    )
}
