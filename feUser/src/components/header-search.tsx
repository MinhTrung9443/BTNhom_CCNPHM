"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeaderSearchProps {
  className?: string;
  placeholder?: string;
  showButton?: boolean;
}

export function HeaderSearch({ className = "", placeholder = "Tìm kiếm sản phẩm...", showButton = true }: HeaderSearchProps) {
  const [keyword, setKeyword] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (keyword.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
    } else {
      router.push("/search");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className={`relative flex ${className}`}>
      <Input
        type="text"
        placeholder={placeholder}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyPress={handleKeyPress}
        className="pl-10 pr-4 bg-white/90 border-white/20 focus:bg-white"
        suppressHydrationWarning
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 w-4 h-4" />
      {showButton && (
        <Button onClick={handleSearch} size="sm" className="ml-2 bg-green-600 hover:bg-green-700" suppressHydrationWarning>
          Tìm
        </Button>
      )}
    </div>
  );
}
