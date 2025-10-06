'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { userService } from '@/services/userService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Coins, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface CheckinStatus {
  canCheckin: boolean;
  lastCheckinDate: string | null;
  nextCheckinDate: string;
}

export default function DailyCheckinPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const [checkinStatus, setCheckinStatus] = useState<CheckinStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const loadCheckinStatus = useCallback(async () => {
    if (!session?.user?.accessToken) return;

    try {
      setLoading(true);
      const response = await userService.getCheckinStatus(session.user.accessToken);
      if (response.success) {
        setCheckinStatus(response.data);
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể tải trạng thái điểm danh',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [session?.user?.accessToken, toast]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.accessToken) {
      loadCheckinStatus();
    }
  }, [status, session?.user?.accessToken, router, loadCheckinStatus]);

  const handleCheckin = async () => {
    if (!session?.user?.accessToken) return;

    try {
      setChecking(true);
      const response = await userService.dailyCheckin(session.user.accessToken);

      if (response.success) {
        toast({
          title: '🎉 Điểm danh thành công!',
          description: response.message,
        });

        // Reload status
        await loadCheckinStatus();
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể điểm danh',
        variant: 'destructive',
      });
    } finally {
      setChecking(false);
    }
  };

  const daysOfWeek = [
    { day: 'T2', label: 'Thứ 2', points: 100, dayIndex: 1 },
    { day: 'T3', label: 'Thứ 3', points: 100, dayIndex: 2 },
    { day: 'T4', label: 'Thứ 4', points: 100, dayIndex: 3 },
    { day: 'T5', label: 'Thứ 5', points: 100, dayIndex: 4 },
    { day: 'T6', label: 'Thứ 6', points: 100, dayIndex: 5 },
    { day: 'T7', label: 'Thứ 7', points: 100, dayIndex: 6 },
    { day: 'CN', label: 'Chủ nhật', points: 200, dayIndex: 0 },
  ];

  const getTodayDayIndex = () => {
    return new Date().getDay();
  };

  const getTodayPoints = () => {
    return getTodayDayIndex() === 0 ? 200 : 100;
  };

  const isToday = (dayIndex: number) => {
    return getTodayDayIndex() === dayIndex;
  };

  const isCheckedIn = (dayIndex: number) => {
    if (!checkinStatus?.lastCheckinDate) return false;
    const lastCheckin = new Date(checkinStatus.lastCheckinDate);
    const today = new Date();
    const isSameDay = lastCheckin.toDateString() === today.toDateString();
    return isSameDay && isToday(dayIndex);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Điểm danh nhận điểm</h1>
          <p className="text-muted-foreground">
            Điểm danh mỗi ngày để nhận điểm miễn phí
          </p>
        </div>

        {/* Main Checkin Card */}
        <Card className="mb-6 overflow-hidden border-2 border-orange-200 bg-gradient-to-br from-orange-50 via-white to-orange-50">
          <CardContent className="p-6">
            {/* Days of Week Grid */}
            <div className="grid grid-cols-7 gap-2 mb-6">
              {daysOfWeek.map((item) => {
                const isTodayDay = isToday(item.dayIndex);
                const isChecked = isCheckedIn(item.dayIndex);
                
                return (
                  <div
                    key={item.dayIndex}
                    className={`relative flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${
                      isTodayDay
                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg scale-105'
                        : isChecked
                        ? 'bg-green-100 border-2 border-green-400'
                        : 'bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    {/* Day Label */}
                    <div className={`text-xs font-semibold mb-1 ${isTodayDay ? 'text-white' : 'text-gray-600'}`}>
                      {item.day}
                    </div>
                    
                    {/* Coin Icon */}
                    <div className={`mb-1 ${isTodayDay ? 'animate-bounce' : ''}`}>
                      {isChecked ? (
                        <CheckCircle2 className={`w-6 h-6 ${isTodayDay ? 'text-white' : 'text-green-600'}`} />
                      ) : (
                        <Coins className={`w-6 h-6 ${isTodayDay ? 'text-white' : 'text-orange-500'}`} />
                      )}
                    </div>
                    
                    {/* Points */}
                    <div className={`text-xs font-bold ${isTodayDay ? 'text-white' : 'text-orange-600'}`}>
                      +{item.points}
                    </div>

                    {/* Today Badge */}
                    {isTodayDay && (
                      <div className="absolute -top-1 -right-1">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Checkin Button */}
            <div className="text-center space-y-4">
              {checkinStatus?.canCheckin ? (
                <>
                  <div className="bg-white rounded-lg p-4 border-2 border-dashed border-orange-300">
                    <p className="text-sm text-gray-600 mb-2">
                      🎁 Nhận ngay <span className="font-bold text-orange-600">{getTodayPoints()} điểm</span> hôm nay!
                    </p>
                    {getTodayDayIndex() === 0 && (
                      <p className="text-xs text-orange-600 font-semibold">
                        ⭐ Chủ nhật nhận gấp đôi!
                      </p>
                    )}
                  </div>
                  <Button
                    size="lg"
                    onClick={handleCheckin}
                    disabled={checking}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {checking ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Gift className="mr-2 h-5 w-5" />
                        Điểm danh nhận {getTodayPoints()} điểm
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                  <div className="flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                  <p className="text-lg font-bold text-green-700 mb-1">
                    ✅ Đã điểm danh hôm nay
                  </p>
                  <p className="text-sm text-gray-600">
                    Bạn đã nhận {getTodayPoints()} điểm. Quay lại vào ngày mai nhé!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2 text-gray-800">
                <Gift className="h-4 w-4" />
                Quy tắc điểm danh
              </h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Thứ 2 - Thứ 7: Nhận 100 điểm/ngày</li>
                <li>• Chủ nhật: Nhận 200 điểm/ngày (gấp đôi)</li>
                <li>• Điểm sẽ hết hạn vào ngày cuối cùng của tháng kế tiếp</li>
                <li>• Mỗi ngày chỉ được điểm danh 1 lần</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
