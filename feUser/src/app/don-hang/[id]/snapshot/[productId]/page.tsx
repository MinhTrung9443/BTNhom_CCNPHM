/**
 * Product Snapshot Page
 * Trang xem ảnh chụp nhanh sản phẩm tại thời điểm đặt hàng
 */
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { orderService } from "@/services/orderService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ExternalLink, Camera, Package, Tag, Star, Eye, ShoppingCart, Clock, TrendingUp } from "lucide-react";
import { ProductSnapshotClient } from "./_components/product-snapshot-client";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(dateString));
};

export default async function ProductSnapshotPage(props: { params: Promise<{ id: string; productId: string }> }) {
  const params = await props.params;
  const session = await auth();

  if (!session?.user?.accessToken) {
    redirect("/login");
  }

  const response = await orderService.getOrderById(session.user.accessToken, params.id);

  if (!response.success || !response.data) {
    redirect("/don-hang");
  }

  const order = response.data;
  const orderLine = order.orderLines.find((line) => line.productId === params.productId);

  if (!orderLine || !orderLine.productSnapshot) {
    redirect(`/don-hang/${params.id}`);
  }

  const snapshot = orderLine.productSnapshot;

  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-4">
          <Button variant="ghost" asChild>
            <Link href={`/don-hang/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại đơn hàng
            </Link>
          </Button>
        </div>

        {/* Main Content */}
        <main className="bg-background rounded-xl shadow-sm border overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 md:p-8 border-b">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Camera className="h-6 w-6 text-primary" />
                  <h1 className="text-2xl lg:text-3xl font-bold">Ảnh Chụp Nhanh Sản Phẩm</h1>
                </div>
                <p className="text-muted-foreground text-sm">
                  Đây là thông tin sản phẩm tại thời điểm bạn đặt hàng
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{formatDate(snapshot.capturedAt)}</span>
                </div>
              </div>
              <Button asChild size="lg" className="shadow-md">
                <Link href={`/chi-tiet-san-pham/${snapshot.slug}`} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Xem trực tiếp
                </Link>
              </Button>
            </div>
          </div>

          {/* Product Info Grid */}
          <div className="grid gap-0 lg:grid-cols-2">
            {/* Left: Images with Swiper */}
            <div className="p-6 md:p-8 border-b lg:border-b-0 lg:border-r">
              <ProductSnapshotClient images={snapshot.images} productName={snapshot.name} />
            </div>

            {/* Right: Details */}
            <div className="p-6 md:p-8 space-y-6">
              {/* Product Name & Badges */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">{snapshot.name}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {snapshot.code}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {snapshot.categoryName}
                  </Badge>
                  {snapshot.isActive ? (
                    <Badge variant="default" className="bg-green-600">Đang bán</Badge>
                  ) : (
                    <Badge variant="destructive">Ngừng bán</Badge>
                  )}
                </div>
              </div>

              <Separator />

              {/* Price Section */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl md:text-4xl font-bold text-primary">{formatPrice(snapshot.price)}</span>
                  {snapshot.discount > 0 && (
                    <Badge variant="destructive" className="text-base px-3 py-1">
                      -{snapshot.discount}%
                    </Badge>
                  )}
                </div>
                {snapshot.discount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Giá sau giảm:</span>
                    <span className="font-bold text-xl text-green-600">
                      {formatPrice(snapshot.price * (1 - snapshot.discount / 100))}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tồn kho</p>
                      <p className="text-lg font-bold">{snapshot.stock}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Đã bán</p>
                      <p className="text-lg font-bold">{snapshot.soldCount}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Lượt xem</p>
                      <p className="text-lg font-bold">{snapshot.viewCount}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                      <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Đánh giá</p>
                      <p className="text-lg font-bold">
                        {snapshot.averageRating.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">({snapshot.totalReviews})</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Mô tả sản phẩm</h3>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{snapshot.description}</p>
              </div>

              <Separator />

              {/* Snapshot Info Alert */}
              <Card className="border-primary/50 bg-primary/5 shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Camera className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="font-semibold text-primary">Thông tin ảnh chụp nhanh</p>
                      <p className="text-sm text-muted-foreground">
                        Ảnh chụp nhanh này lưu lại thông tin sản phẩm tại thời điểm bạn đặt hàng. Thông tin hiện tại của sản phẩm có thể đã thay đổi.
                      </p>
                    </div>
                  </div>
                  <Button asChild className="w-full" variant="outline" size="lg">
                    <Link href={`/chi-tiet-san-pham/${snapshot.slug}`} target="_blank">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Xem thông tin sản phẩm hiện tại
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
