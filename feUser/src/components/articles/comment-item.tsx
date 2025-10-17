"use client";

import { useState } from "react";
import { Comment } from "@/types/article";
import { CommentForm } from "./comment-form";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Heart, MessageCircle, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommentItemProps {
  comment: Comment;
  onReply: (commentId: string, content: string) => Promise<void>;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onLike: (commentId: string) => Promise<void>;
  level?: number;
}

export function CommentItem({
  comment,
  onReply,
  onEdit,
  onDelete,
  onLike,
  level = 0,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const canReply = level < 2; // Max 3 levels (0, 1, 2)
  const canEdit = comment.userInteraction?.canEdit;
  const canDelete = comment.userInteraction?.canDelete;
  const hasLiked = comment.userInteraction?.hasLiked;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleReply = async (content: string) => {
    await onReply(comment._id, content);
    setShowReplyForm(false);
  };

  const handleEdit = async (content: string) => {
    await onEdit(comment._id, content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await onDelete(comment._id);
    setShowDeleteDialog(false);
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await onLike(comment._id);
    } finally {
      setIsLiking(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn("flex gap-3", level > 0 && "ml-8 md:ml-12")}>
      <Avatar className="w-8 h-8 md:w-10 md:h-10">
        <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
        <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">
                {comment.author.name}
              </span>
              {comment.author.isAdmin && (
                <Badge variant="default" className="text-xs">
                  Admin
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDate(comment.createdAt)}
              </span>
              {comment.isEdited && (
                <span className="text-xs text-muted-foreground italic">
                  (đã chỉnh sửa)
                </span>
              )}
            </div>

            {(canEdit || canDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEdit && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isEditing ? (
            <CommentForm
              onSubmit={handleEdit}
              onCancel={() => setIsEditing(false)}
              placeholder="Chỉnh sửa bình luận..."
              submitLabel="Lưu"
              autoFocus
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-auto p-0 hover:bg-transparent",
              hasLiked && "text-red-500"
            )}
            onClick={handleLike}
            disabled={isLiking}
          >
            <Heart
              className={cn("w-4 h-4 mr-1", hasLiked && "fill-current")}
            />
            {comment.likes > 0 && <span>{comment.likes}</span>}
          </Button>

          {canReply && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 hover:bg-transparent"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Trả lời
            </Button>
          )}
        </div>

        {showReplyForm && (
          <div className="mt-3">
            <CommentForm
              onSubmit={handleReply}
              onCancel={() => setShowReplyForm(false)}
              placeholder="Viết câu trả lời..."
              submitLabel="Trả lời"
              autoFocus
            />
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply._id}
                comment={reply}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onLike={onLike}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bình luận</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
