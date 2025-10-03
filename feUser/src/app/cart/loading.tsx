import { Skeleton } from "@/components/ui/skeleton";

export default function CartLoading() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title Skeleton */}
        <Skeleton className="h-9 w-1/3 mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {/* Select All Card Skeleton */}
            <Skeleton className="h-16 w-full" />

            {/* Cart Item Skeletons */}
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-40 w-full" />
            ))}
          </div>

          <div>
            {/* Order Summary Skeleton */}
            <Skeleton className="h-64 w-full sticky top-24" />
          </div>
        </div>
      </div>
    </main>
  );
}