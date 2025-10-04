import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, RefreshCw, Zap } from 'lucide-react';

/**
 * ISR Test Page
 * 
 * Trang này dùng để test ISR thuần túy với:
 * - Public API (JSONPlaceholder) - không liên quan backend
 * - Revalidate mỗi 10 giây
 * - Hiển thị rõ ràng cache hit/miss
 * 
 * CÁCH TEST:
 * 1. npm run build
 * 2. npm start
 * 3. Truy cập http://localhost:3000/test-isr
 * 4. Refresh nhiều lần trong 10s → thấy timestamp KHÔNG đổi = cache hit
 * 5. Đợi > 10s → Refresh → timestamp đổi = revalidate
 */

// ⚡ ISR Config - Cache 10 giây
export const revalidate = 10;

// Force static generation để Next.js cache hoàn toàn
export const dynamic = 'force-static';

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}

export default async function TestISRPage() {
  // Fetch trực tiếp trong component
  const startTime = Date.now();
  const fetchTimestamp = new Date().toISOString();
  
  console.log(`🔥 [ISR TEST ${fetchTimestamp}] Starting fetch...`);
  
  // Fetch từ JSONPlaceholder API (public, free API)
  const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5', {
    next: { revalidate: 10 } // Sync với page-level revalidate
  });
  
  const posts: Post[] = await response.json();
  const duration = Date.now() - startTime;
  
  console.log(`✅ [ISR TEST] Completed in ${duration}ms ${duration < 100 ? '⚡ CACHE HIT' : '🐌 CACHE MISS (fetched from API)'}`);
  
  const fetchedAt = fetchTimestamp;
  const renderedAt = new Date().toISOString();
  
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🧪 ISR Test Page
            </h1>
            <p className="text-lg text-gray-600">
              Kiểm tra Incremental Static Regeneration của Next.js
            </p>
          </div>

          {/* Status Card */}
          <Card className="mb-8 border-2 border-blue-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-6 h-6" />
                Cache Status
              </CardTitle>
              <CardDescription className="text-blue-100">
                Revalidate: 10 giây | API: JSONPlaceholder
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Fetch Time */}
                <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                  <Clock className="w-8 h-8 text-blue-600 mb-2" />
                  <div className="text-sm text-gray-600 mb-1">Data Fetched At</div>
                  <div className="font-mono text-xs text-center">
                    {new Date(fetchedAt).toLocaleTimeString('vi-VN')}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(fetchedAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>

                {/* Render Time */}
                <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                  <RefreshCw className="w-8 h-8 text-green-600 mb-2" />
                  <div className="text-sm text-gray-600 mb-1">Page Rendered At</div>
                  <div className="font-mono text-xs text-center">
                    {new Date(renderedAt).toLocaleTimeString('vi-VN')}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(renderedAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>

                {/* Duration */}
                <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
                  <Zap className="w-8 h-8 text-purple-600 mb-2" />
                  <div className="text-sm text-gray-600 mb-1">Response Time</div>
                  <div className="font-bold text-2xl text-purple-600">
                    {duration}ms
                  </div>
                  <Badge 
                    variant={duration < 100 ? "default" : "secondary"}
                    className={duration < 100 ? "bg-green-500" : "bg-orange-500"}
                  >
                    {duration < 100 ? '⚡ Cache Hit' : '🐌 Cache Miss'}
                  </Badge>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">
                  📖 Cách Test ISR:
                </h3>
                <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                  <li>
                    <strong>Refresh trang nhiều lần trong 10 giây:</strong>
                    <ul className="ml-6 mt-1 space-y-1">
                      <li>✅ &ldquo;Data Fetched At&rdquo; KHÔNG đổi = Cache hit</li>
                      <li>✅ Response time {'<'} 100ms</li>
                      <li>✅ Badge hiển thị &ldquo;⚡ Cache Hit&rdquo;</li>
                    </ul>
                  </li>
                  <li className="mt-2">
                    <strong>Đợi hơn 10 giây rồi refresh:</strong>
                    <ul className="ml-6 mt-1 space-y-1">
                      <li>🔄 &ldquo;Data Fetched At&rdquo; thay đổi = Revalidate</li>
                      <li>🔄 Response time {'>'} 100ms (lần đầu)</li>
                      <li>🔄 Badge hiển thị &ldquo;🐌 Cache Miss&rdquo;</li>
                    </ul>
                  </li>
                  <li className="mt-2">
                    <strong>Kiểm tra console logs:</strong>
                    <ul className="ml-6 mt-1 space-y-1">
                      <li>⚠️ Trong dev mode: Luôn thấy log (cache tắt)</li>
                      <li>✅ Trong production: Chỉ thấy log khi cache miss</li>
                    </ul>
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Data Display */}
          <Card>
            <CardHeader>
              <CardTitle>📝 Sample Data (từ JSONPlaceholder)</CardTitle>
              <CardDescription>
                5 posts đầu tiên - Data này được cache bởi Next.js ISR
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posts.map((post) => (
                  <div 
                    key={post.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">
                        #{post.id}
                      </Badge>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {post.body}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Footer Info */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              💡 Tip: Mở DevTools → Network tab để xem request có được cache không
            </p>
            <p className="mt-1">
              🔧 Nếu đang chạy dev mode, hãy build production: <code className="bg-gray-200 px-2 py-1 rounded">npm run build && npm start</code>
            </p>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
