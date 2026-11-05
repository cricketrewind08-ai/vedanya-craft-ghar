"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Category } from "@/lib/services/products";

interface ShopFiltersProps {
  categories: Category[];
  currentCategory: string;
  currentSearch: string;
  currentSort: string;
}

export function ShopFilters({
  categories,
  currentCategory,
  currentSearch,
  currentSort,
}: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    router.push(`/shop?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q")?.toString().trim();
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    router.push(`/shop?${params.toString()}`);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Category Pills & Controls Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-[#D8CCBE]/70">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => handleCategoryChange("all")}
            className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide whitespace-nowrap transition-colors ${
              currentCategory === "all"
                ? "bg-[#453C35] text-white"
                : "bg-white/80 hover:bg-[#E9DCCB] text-[#453C35] border border-[#D8CCBE]"
            }`}
          >
            All Creations
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.slug)}
              className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide whitespace-nowrap transition-colors ${
                currentCategory === cat.slug
                  ? "bg-[#453C35] text-white"
                  : "bg-white/80 hover:bg-[#E9DCCB] text-[#453C35] border border-[#D8CCBE]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative flex-1 md:w-64">
            <input
              type="text"
              name="q"
              defaultValue={currentSearch}
              placeholder="Search items..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-[#D8CCBE] bg-white text-[#453C35] focus:outline-none focus:ring-1 focus:ring-[#B97968]"
            />
            <Search className="w-4 h-4 text-[#7D726A] absolute left-3 top-2.5" />
          </form>

          <div className="relative">
            <select
              value={currentSort}
              onChange={handleSortChange}
              className="appearance-none pl-8 pr-8 py-2 text-xs rounded-lg border border-[#D8CCBE] bg-white text-[#453C35] focus:outline-none focus:ring-1 focus:ring-[#B97968] cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
            </select>
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#7D726A] absolute left-2.5 top-3 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}

