"use client";

import { CommentForm } from "./comment-form";
import { CommentItem } from "./comment-item";
import { useComments } from "@/hooks/use-comments";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, MessageCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface CommentSectionProps {
  articleId: string;
}

export function CommentSection({ articleId }: CommentSectionProps) {
  const { toast } = useToast();
  const {
    comments,
    loading,
    error,
    hasMore,
    loadMore,
    addComment,
    updateComment,
    deleteComment,
    toggleLike,
  } = useComments(articleId);

  const handleAddComment = async (content: string) => {
    try {
      await addComment(content);
      toast({
        title: "Thành công",
        description: "Bình luận của bạn đã được gửi",
      });
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message || "Không thể gửi bình luận",
        variant: "destructive",
      });
      throw err;
    }
  };

  const handleReply = async (commentId: string, content: string) => {
    try {
      await addComment(content, commentId);
      toast({
        title: "Thành công",
        description: "Câu trả lời của bạn đã được gửi",
      });
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message || "Không thể gửi câu trả lời",
        variant: "destructive",
      });
      throw err;
    }
  };

  const handleEdit = async (commentId: string, content: string) => {
    try {
      await updateComment(commentId, content);
      toast({
        title: "Thành công",
        description: "Bình luận đã được cập nhật",
      });
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message || "Không thể cập nhật bình luận",
        variant: "destructive",
      });
      throw err;
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      toast({
        title: "Thành công",
        description: "Bình luận đã được xóa",
      });
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message || "Không thể xóa bình luận",
        variant: "destructive",
      });
      throw err;
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      await toggleLike(commentId);
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message || "Không thể thích bình luận",
        variant: "destructive",
      });
      throw err;
    }
  };

  return (
    <div className="mt-12">
      <Separator className="mb-8" />

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <h2 className="text-2xl font-bold">
            Bình luận ({comments.length})
          </h2>
        </div>

        {/* Comment Form */}
        <CommentForm onSubmit={handleAddComment} />

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Comments List */}
        {loading && comments.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onLike={handleLike}
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tải...
                </>
              ) : (
                "Xem thêm bình luận"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
