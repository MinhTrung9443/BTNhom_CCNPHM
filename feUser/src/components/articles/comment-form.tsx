"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Send } from "lucide-react";
import Link from "next/link";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  submitLabel?: string;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export function CommentForm({
  onSubmit,
  placeholder = "Viết bình luận của bạn...",
  submitLabel = "Gửi bình luận",
  onCancel,
  autoFocus = false,
}: CommentFormProps) {
  const { data: session, status } = useSession();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Vui lòng nhập nội dung bình luận");
      return;
    }

    if (content.length > 1000) {
      setError("Bình luận không được vượt quá 1000 ký tự");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit(content.trim());
      setContent("");
    } catch (err: any) {
      setError(err.message || "Không thể gửi bình luận");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-4 border rounded-lg bg-muted/50">
        <p className="text-sm text-muted-foreground mb-2">
          Bạn cần đăng nhập để bình luận
        </p>
        <Link href="/login">
          <Button size="sm">Đăng nhập</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        maxLength={1000}
        disabled={submitting}
        autoFocus={autoFocus}
        className="resize-none"
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {content.length}/1000 ký tự
        </span>
        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={submitting}
            >
              Hủy
            </Button>
          )}
          <Button type="submit" size="sm" disabled={submitting || !content.trim()}>
            {submitting ? (
              "Đang gửi..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {submitLabel}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
