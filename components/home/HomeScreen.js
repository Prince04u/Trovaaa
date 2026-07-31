"use client";

import Link from "next/link";
import BottomNav from "./BottomNav";
import { Trophy, Download, Image as ImageIcon } from "lucide-react";

export default function HomeScreen() {
  // Mock jewelry product catalog data from your screenshots
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

  return (
    <main className="min-h-screen bg-[#F7F7F7] pb-20 flex flex-col max-w-[480px] mx-auto relative shadow-md select-none text-[#222222]">
      {/* Top Banner Install App */}
      <section className="bg-white border-b border-gray-200 h-12 px-4 flex items-center justify-between text-xs text-gray-500 font-semibold select-none shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#009688]/10 flex items-center justify-center text-[#009688]">
            <Trophy size={14} />
          </div>
          <span>Open with an app</span>
        </div>
        <button type="button" className="text-gray-400 hover:text-gray-600 cursor-pointer p-1">
          <Download size={18} strokeWidth={2.5} />
        </button>
      </section>

      {/* Main welcome titles */}
      <section className="py-6 text-center select-none flex flex-col gap-1 bg-white">
        <h1 className="text-[22px] font-normal leading-[1.2] text-[#009688]">
          Welcome Back
        </h1>
        <span className="text-[14px] text-[#8A8A8A] font-normal leading-normal mt-1">
          Quality Guarantee
        </span>
      </section>

      {/* Blank Image Banner Placeholder */}
      <section className="w-full aspect-[16/9] bg-gray-200 border-y border-gray-300 flex flex-col items-center justify-center text-gray-400 select-none p-4 text-center">
        <ImageIcon size={32} className="text-gray-300 mb-1" />
        <span className="text-[11px] font-normal tracking-wide">Image Banner Area</span>
      </section>


      {/* 2-Column Product Grid list matching screenshots */}
      <section className="px-3 pb-6 flex flex-col gap-3">
        <h2 className="text-xs font-normal text-gray-400 uppercase tracking-wider px-1">Shop Catalog</h2>
        
        <div className="grid grid-cols-2 gap-3">
          {products.map((p) => (
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
      </section>

      <BottomNav />
    </main>
  );
}