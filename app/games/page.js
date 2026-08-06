"use client";

import { useState } from "react";
import BottomNav from "@/components/home/BottomNav";
import { Search, Image as ImageIcon } from "lucide-react";

export default function GamesCatalogPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const products = [
    {
      id: 1,
      title: "Joyalukkas 18k (750) Rose Gold and Solitaire Pendant for Girls",
      price: "₹ 38576.00"
    },
    {
      id: 2,
      title: "Ratnavali Jewels American Diamond Traditional Fashion Jewellery Green Necklace Pendant Set with Earring",
      price: "₹ 2899.00"
    },
    {
      id: 3,
      title: "Swasti Jewels Heart Shape Fashion Jewellery Set Pendant Earrings for Women",
      price: "₹ 4559.00"
    },
    {
      id: 4,
      title: "Om Jewells Rhodium Plated Blue Crystal Jewellery Combo of Designer Drop Pendant Set",
      price: "₹ 1599.00"
    },
    {
      id: 5,
      title: "Sukkhi Gleaming Pearl Gold Plated Wedding Jewellery Kundan Peacock Meenakari Multi-String Necklace",
      price: "₹ 1745.00"
    },
    {
      id: 6,
      title: "Ananth Jewels 925 Sterling Silver BIS Hallmarked Heart Bracelet for Women",
      price: "₹ 9000.00"
    },
    {
      id: 7,
      title: "Handicraft Kottage ® 1gm 22Ct Gold Plated Pendant and Chain for Men/Women/Girls",
      price: "₹ 999.00"
    },
    {
      id: 8,
      title: "Mansiyaorange Combo of Two Party One Gram Gold Forming Long Haram and Choker Set",
      price: "₹ 3199.00"
    }
  ];

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#F7F7F7] pb-24 flex flex-col max-w-[480px] mx-auto relative shadow-md select-none text-[#222222]">
      {/* Sticky Header with Search */}
      <header className="bg-[#009688] text-white px-4 h-14 flex items-center justify-between sticky top-0 z-40 select-none shadow-sm">
        <h1 className="text-[17px] font-semibold tracking-wide">Search Products</h1>
      </header>

      {/* Interactive Search Bar Section */}
      <section className="p-3 bg-white border-b border-gray-200 sticky top-14 z-30">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-[#F7F7F7] text-gray-800 placeholder-gray-400 outline-none focus:border-[#009688] transition-colors"
          />
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
      </section>

      {/* 2-Column Product Grid list matching home screen */}
      <section className="px-3 py-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((p) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-[6px] p-2.5 flex flex-col gap-2 shadow-sm hover:border-gray-300 transition-colors">
              {/* Aspect Square Image Placeholder space */}
              <div className="w-full aspect-square bg-[#FAFAFA] border border-gray-100 rounded-[4px] flex flex-col items-center justify-center text-gray-300 select-none">
                <ImageIcon size={24} className="opacity-80" />
                <span className="text-[9px] mt-1 font-bold">Photo Space</span>
              </div>

              {/* Title descriptions */}
              <h3 className="text-[13px] text-gray-700 font-normal line-clamp-2 h-[36px] leading-tight select-none overflow-hidden text-ellipsis">
                {p.title}
              </h3>

              {/* Price text in Orange */}
              <strong className="text-[14px] text-[#E65100] font-medium select-none leading-none">
                {p.price}
              </strong>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-[14px]">No products found</p>
            <span className="text-[11px] mt-1 block">Try searching for other keywords</span>
          </div>
        )}
      </section>

      <BottomNav />
    </main>
  );
}
