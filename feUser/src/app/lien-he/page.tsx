import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";

export default function LienHePage() {
  return (
    <div className="container mx-auto max-w-6xl py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Liên hệ với Chúng tôi
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Chúng tôi luôn sẵn lòng lắng nghe bạn. Vui lòng điền vào biểu mẫu
          bên dưới hoặc sử dụng thông tin của chúng tôi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Contact Information & Map */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin liên hệ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-4">
                <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Địa chỉ</h3>
                  <p className="text-gray-600">
                    Số 1, Đường Lý Tự Trọng, Phường 2, TP. Sóc Trăng, Tỉnh Sóc
                    Trăng
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Phone className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Điện thoại</h3>
                  <p className="text-gray-600">(+84) 123 456 789</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Mail className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-gray-600">hotro@dacsansoctrang.vn</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <div className="h-80 w-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62860.63920739323!2d105.94222037910157!3d9.605333100000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a0097a3363684d%3A0x4997034177651b1!2zVHAuIFPDs2MgVHLEg25nLCBTw7NjIFRyxINuZywgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1689849494392!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </Card>
        </div>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Gửi tin nhắn cho chúng tôi</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div>
                <Label htmlFor="name">Họ và tên</Label>
                <Input id="name" placeholder="Nhập họ và tên của bạn" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Nhập địa chỉ email"
                />
              </div>
              <div>
                <Label htmlFor="subject">Chủ đề</Label>
                <Input id="subject" placeholder="Nhập chủ đề tin nhắn" />
              </div>
              <div>
                <Label htmlFor="message">Nội dung</Label>
                <Textarea
                  id="message"
                  placeholder="Nội dung tin nhắn của bạn"
                  rows={6}
                />
              </div>
              <Button type="submit" className="w-full">
                Gửi tin nhắn
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}