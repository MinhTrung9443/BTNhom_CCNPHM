import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function OrderDetailLoading() {
  return (
    <div className="bg-muted/40">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button Skeleton */}
        <div className="mb-4">
          <Skeleton className="h-10 w-40">
            <div className="flex items-center p-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span>Quay lại danh sách</span>
            </div>
          </Skeleton>
        </div>

        {/* Main Content Wrapper Skeleton */}
        <div className="bg-background rounded-xl shadow-sm border p-6 md:p-8 space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
            <div className="space-y-2">
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-56" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-10 w-28 rounded-md" />
            </div>
          </div>

          <Skeleton className="h-px w-full" />

          {/* Grid Layout Skeleton */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-2 space-y-8">
              {/* Order Items Skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>

              {/* Timeline Skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>

            {/* Right Column (Sidebar) Skeleton */}
            <div className="space-y-8">
              <Skeleton className="h-80 w-full sticky top-24" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}