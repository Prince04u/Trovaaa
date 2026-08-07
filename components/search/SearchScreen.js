"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/home/BottomNav";

const ALL_PRODUCTS = [
  {
    "id": 1,
    "title": "Joyalukkas 18k (750) Rose Gold and Solitaire Pendant for Girls",
    "price": "38576.00",
    "image": "https://art.apex-king.com/uploads/images/51iEBQzCL5L._UL1500_.jpg"
  },
  {
    "id": 2,
    "title": "Ratnavali Jewels American Diamond Traditional Fashion Jewellery Green Necklace Pendant Set with Earring for Women/Girls RV2916G",
    "price": "2899.00",
    "image": "https://art.apex-king.com/uploads/images/71JvL64Y3cL._UY695_.jpg"
  },
  {
    "id": 3,
    "title": "Swasti Jewels Heart Shape Fashion Jewellery Set Pendant Earrings for Women",
    "price": "4559.00",
    "image": "https://art.apex-king.com/uploads/images/71YWzTc2omL._UY695_.jpg"
  },
  {
    "id": 4,
    "title": "Om Jewells Rhodium Plated Blue Crystal Jewellery Combo of Designer Drop Pendant Set with Adjustable Bangle Kada and Adjustable Solitaire Finger Ring for Girls and Women CO1000209",
    "price": "1599.00",
    "image": "https://art.apex-king.com/uploads/images/4.jpg"
  },
  {
    "id": 5,
    "title": "Sukkhi Gleaming Pearl Gold Plated Wedding Jewellery Kundan Peacock Meenakari Multi-String Necklace Set for Women (2191NGLDPP1560)",
    "price": "1745.00",
    "image": "https://art.apex-king.com/uploads/images/5.jpg"
  },
  {
    "id": 6,
    "title": "Ananth Jewels 925 Sterling Silver BIS Hallmarked Heart Bracelet for Women",
    "price": "9000.00",
    "image": "https://art.apex-king.com/uploads/images/6.jpg"
  },
  {
    "id": 7,
    "title": "Handicraft Kottage ® 1gm 22Ct Gold Plated Pendant and Chain for Men/Women/Girls",
    "price": "999.00",
    "image": "https://art.apex-king.com/uploads/images/7.jpg"
  },
  {
    "id": 8,
    "title": "Mansiyaorange Combo of Two Party One Gram Gold Forming Long Haram and Choker Multi Color Jewellery Necklace/Juelry/jwelry Set Jewellery for Women",
    "price": "3199.00",
    "image": "https://art.apex-king.com/uploads/images/8.jpg"
  },
  {
    "id": 9,
    "title": "Young & Forever Fashion Jewellery Elite Rose Gold Plated Geometric Shape Stud Earring Pendant Set for Women Princess Length Delicate Chain Cubic Zirconia Necklace Set for Girls Jewelry",
    "price": "4450.00",
    "image": "https://art.apex-king.com/uploads/images/9.jpg"
  },
  {
    "id": 10,
    "title": "Ratnavali Jewels American Diamond Cz Gold Plated Necklace Set Tennis Necklace Single Line Solitaire Set With Chain & Earring For Women",
    "price": "4000.00",
    "image": "https://art.apex-king.com/uploads/images/10.jpg"
  },
  {
    "id": 11,
    "title": "chandrika pearls gems & jewellers Sania Mirza Style Without Piercing Clip on Pressing Type Nose Ring for Women & Girls",
    "price": "278.00",
    "image": "https://art.apex-king.com/uploads/images/11.jpg"
  },
  {
    "id": 12,
    "title": "Chandrika Pearls Gems & Jewellers Sterling Silver Pendant Earring with Swarovski Crystal for Girls",
    "price": "1060.00",
    "image": "https://art.apex-king.com/uploads/images/12.jpg"
  },
  {
    "id": 13,
    "title": "Chandrika Pearls Gems & Jewellers 92.5 Sterling Silver Real Diamond Valentine Crown King Queen Ring for Girls & Women",
    "price": "1920.00",
    "image": "https://art.apex-king.com/uploads/images/13.jpg"
  },
  {
    "id": 14,
    "title": "Chandrika Pearls Gems & Jewellers 925 Pure Sterling Silver Letters Initial Pendant with Gold Polish (R)",
    "price": "476.00",
    "image": "https://art.apex-king.com/uploads/images/14.jpg"
  },
  {
    "id": 15,
    "title": "Chandrika Pearls Gems & Jewellers Dhanteras Brass Hindu Puja Camphor Burner Lamp Panch Aarti - 5 Face For Puja",
    "price": "1880.00",
    "image": "https://art.apex-king.com/uploads/images/15.jpg"
  },
  {
    "id": 16,
    "title": "Jewels Galaxy Designer American Diamond Gold Plated Bangles for Women/Girls",
    "price": "1999.00",
    "image": "https://art.apex-king.com/uploads/images/16.jpg"
  }
];

export default function SearchScreen() {
  const [keywords, setKeywords] = useState("");

  const filteredProducts = ALL_PRODUCTS.filter(p =>
    p.title.toLowerCase().includes(keywords.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#F7F7F7] pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#222222]">
      {/* Top Search Input Box matching luvomall.games */}
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
      <section className="w-full bg-white p-[15px] box-border" style={{ boxShadow: "rgba(0, 0, 0, 0.2) 0px 3px 1px -2px, rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px" }}>
        <div className="flex flex-wrap w-full">
          {filteredProducts.map((p) => (
            <div key={p.id} className="w-1/2 p-[4px] box-border">
              <Link
                href={`/product?goodsId=${p.id}`}
                className="bg-white rounded-[2px] flex flex-col text-decoration-none transition-colors overflow-hidden"
                style={{ boxShadow: "rgba(0, 0, 0, 0.2) 0px 3px 1px -2px, rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px" }}
              >
                <div className="w-full h-[200px] p-[8px] box-border">
                  <div
                    className="w-full h-full bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${p.image})` }}
                  />
                </div>

                <div className="h-[58px] overflow-hidden p-[8px] text-[14px] text-center box-border text-[rgba(0,0,0,0.87)] leading-tight">
                  {p.title}
                </div>

                <div className="inline-block text-[#f39839] p-[8px] text-[14px] box-border leading-none font-medium">
                  ₹ {p.price}
                </div>
              </Link>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="w-full text-center py-12 text-gray-400 text-[14px]">
              No goods found matching "{keywords}"
            </div>
          )}
        </div>
      </section>

      <BottomNav />
    </main>
  );
}
