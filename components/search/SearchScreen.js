"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/home/BottomNav";

const ALL_PRODUCTS = [
  {
    id: 1,
    title: "Joyalukkas 18k (750) Rose Gold and Solitaire Pendant for Girls",
    price: "38576.00",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 2,
    title: "Ratnavali Jewels American Diamond Traditional Fashion Jewellery Green Necklace Pendant Set with Earring",
    price: "2899.00",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 3,
    title: "Swasti Jewels Heart Shape Fashion Jewellery Set Pendant Earrings for Women",
    price: "4559.00",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 4,
    title: "Om Jewells Rhodium Plated Blue Crystal Jewellery Combo of Designer Drop Pendant Set",
    price: "1599.00",
    image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 5,
    title: "Sukkhi Gleaming Pearl Gold Plated Wedding Jewellery Kundan Peacock Meenakari Multi-String Necklace",
    price: "1745.00",
    image: "https://images.unsplash.com/photo-1611591475140-be38b63731d9?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 6,
    title: "Ananth Jewels 925 Sterling Silver BIS Hallmarked Heart Bracelet for Women",
    price: "9000.00",
    image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 7,
    title: "Handicraft Kottage ® 1gm 22Ct Gold Plated Pendant and Chain for Men/Women/Girls",
    price: "999.00",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 8,
    title: "Mansiyaorange Combo of Two Party One Gram Gold Forming Long Haram and Choker Set",
    price: "3199.00",
    image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=400&q=80"
  }
];

export default function SearchScreen() {
  const [keywords, setKeywords] = useState("");

  const filteredProducts = ALL_PRODUCTS.filter(p =>
    p.title.toLowerCase().includes(keywords.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#F7F7F7] pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#222222]">
      {/* Top Search Input Box matching bruzoo.games */}
      <section className="bg-white p-3 border-b border-gray-200 sticky top-0 z-10 shadow-sm w-full">
        <div className="bg-[#f0f0f0] rounded-[20px] px-4 py-2 flex items-center gap-2 border border-gray-200">
          <span className="material-icons-outlined text-gray-400 text-[20px]">search</span>
          <input
            type="text"
            placeholder="Search for goods"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-[14px] text-[#333333]"
          />
        </div>
      </section>

      {/* 2-Column Product Grid Catalog */}
      <section className="p-3 w-full">
        <div className="grid grid-cols-2 gap-3 w-full">
          {filteredProducts.map((p) => (
            <Link
              key={p.id}
              href={`/product?goodsId=${p.id}`}
              className="bg-white border border-gray-200 rounded-[6px] p-2.5 flex flex-col gap-2 shadow-sm text-decoration-none hover:border-gray-300 transition-colors"
            >
              <div 
                className="w-full aspect-square bg-[#FAFAFA] rounded-[4px] bg-cover bg-center border border-gray-100"
                style={{ backgroundImage: `url(${p.image})` }}
              />

              <h3 className="text-[13px] text-gray-700 font-normal line-clamp-3 h-[52px] leading-tight select-none overflow-hidden text-ellipsis m-0">
                {p.title}
              </h3>

              <strong className="text-[14px] text-[#E65100] font-medium select-none leading-none">
                ₹ {p.price}
              </strong>
            </Link>
          ))}

          {filteredProducts.length === 0 && (
            <div className="col-span-2 text-center py-12 text-gray-400 text-[14px]">
              No goods found matching "{keywords}"
            </div>
          )}
        </div>
      </section>

      <BottomNav />
    </main>
  );
}
