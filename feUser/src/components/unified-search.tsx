"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface UnifiedSearchProps {
  className?: string;
  placeholder?: string;
}

export function UnifiedSearch({
  className = "",
  placeholder = "Tìm kiếm sản phẩm hoặc bài viết...",
}: UnifiedSearchProps) {
  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState(false);
  const [searchType, setSearchType] = useState<"products" | "articles">("products");
  const router = useRouter();

  const handleSearch = () => {
    if (keyword.trim()) {
      if (searchType === "articles") {
        router.push(`/bai-viet?keyword=${encodeURIComponent(keyword.trim())}`);
      } else {
        router.push(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
      }
    } else {
      if (searchType === "articles") {
        router.push("/bai-viet");
      } else {
        router.push("/search");
      }
    }
    setOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className={cn("relative flex items-center", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-3 border-r-0 rounded-r-none bg-white/90 hover:bg-white"
          >
            {searchType === "articles" ? (
              <FileText className="w-4 h-4 mr-2" />
            ) : (
              <Package className="w-4 h-4 mr-2" />
            )}
            <span className="hidden sm:inline">
              {searchType === "articles" ? "Bài viết" : "Sản phẩm"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandList>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setSearchType("products");
                    setOpen(false);
                  }}
                >
                  <Package className="w-4 h-4 mr-2" />
                  <span>Sản phẩm</span>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setSearchType("articles");
                    setOpen(false);
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  <span>Bài viết</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="relative flex-1">
        <Input
          type="text"
          placeholder={placeholder}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-10 pr-4 bg-white/90 border-l-0 rounded-l-none focus:bg-white"
          suppressHydrationWarning
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 w-4 h-4" />
      </div>

      <Button
        onClick={handleSearch}
        size="sm"
        className="ml-2 bg-green-600 hover:bg-green-700"
        suppressHydrationWarning
      >
        Tìm
      </Button>
    </div>
  );
}
