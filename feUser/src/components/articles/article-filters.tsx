"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArticleFilters as ArticleFiltersType } from "@/types/article";

interface ArticleFiltersProps {
  onFilterChange: (filters: ArticleFiltersType) => void;
  availableTags?: string[];
}

export function ArticleFilters({
  onFilterChange,
  availableTags = [],
}: ArticleFiltersProps) {
  const [keyword, setKeyword] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"publishedAt" | "views" | "likes">(
    "publishedAt"
  );

  const handleSearch = () => {
    onFilterChange({
      keyword: keyword.trim() || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      sortBy,
      sortOrder: "desc",
    });
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => {
      const newTags = prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag];
      
      // Auto-apply filter when tag changes
      setTimeout(() => {
        onFilterChange({
          keyword: keyword.trim() || undefined,
          tags: newTags.length > 0 ? newTags : undefined,
          sortBy,
          sortOrder: "desc",
        });
      }, 0);
      
      return newTags;
    });
  };

  const handleSortChange = (value: string) => {
    const newSortBy = value as "publishedAt" | "views" | "likes";
    setSortBy(newSortBy);
    onFilterChange({
      keyword: keyword.trim() || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      sortBy: newSortBy,
      sortOrder: "desc",
    });
  };

  const handleClearFilters = () => {
    setKeyword("");
    setSelectedTags([]);
    setSortBy("publishedAt");
    onFilterChange({});
  };

  const hasActiveFilters = keyword || selectedTags.length > 0;

  return (
    <div className="space-y-4 mb-8 p-4 md:p-6 bg-card rounded-lg border">
      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="publishedAt">Mới nhất</SelectItem>
              <SelectItem value="views">Xem nhiều nhất</SelectItem>
              <SelectItem value="likes">Yêu thích nhất</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} variant="default">
            <Search className="w-4 h-4 mr-2" />
            Tìm kiếm
          </Button>
        </div>
      </div>

      {/* Tags Filter */}
      {availableTags.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Lọc theo chủ đề:</p>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/90 transition-colors"
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
                {selectedTags.includes(tag) && (
                  <X className="w-3 h-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Xóa bộ lọc
          </Button>
        </div>
      )}
    </div>
  );
}
