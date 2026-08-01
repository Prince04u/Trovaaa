"use client";

import Link from "next/link";
import BottomNav from "./BottomNav";

const PRODUCTS = [
  {
    id: 1,
    title: "【 Now 】 Series White 18K Gold Pair Ring",
    price: "38570.00",
    image: "https://picsum.photos/seed/ring1/600/600"
  },
  {
    id: 2,
    title: "【Cute Pet】 Series Rose 18K Gold Pearl Pendant",
    price: "2899.00",
    image: "https://picsum.photos/seed/pendant1/600/600"
  },
  {
    id: 3,
    title: "18K Gold Diamond Ruby Deer Horn Collar Chain",
    price: "4559.00",
    image: "https://picsum.photos/seed/chain1/600/600"
  },
  {
    id: 4,
    title: "Enzo Jewelry 14k Gold Seven Colored Gemstone Pendant",
    price: "5599.00",
    image: "https://picsum.photos/seed/gemstone1/600/600"
  },
  {
    id: 5,
    title: "Sukkhi Gleaming Pearl Gold Plated Wedding Jewellery Kundan Peacock Meenakari Multi-String Necklace",
    price: "1745.00",
    image: "https://picsum.photos/seed/necklace1/600/600"
  },
  {
    id: 6,
    title: "Ananth Jewels 925 Sterling Silver BIS Hallmarked Heart Bracelet for Women",
    price: "9000.00",
    image: "https://picsum.photos/seed/bracelet1/600/600"
  },
  {
    id: 7,
    title: "Handicraft Kottage ® 1gm 22Ct Gold Plated Pendant and Chain for Men/Women/Girls",
    price: "999.00",
    image: "https://picsum.photos/seed/pendant2/600/600"
  },
  {
    id: 8,
    title: "Mansiyaorange Combo of Two Party One Gram Gold Forming Long Haram and Choker Set",
    price: "3199.00",
    image: "https://picsum.photos/seed/choker1/600/600"
  }
];

export default function HomeScreen() {
  return (
    <main className="min-h-screen bg-[#F7F7F7] pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#222222]">
      {/* Top Banner Install App matching indexs.vue */}
      <section className="bg-white border-b border-gray-200 h-12 px-4 flex items-center justify-between text-xs text-gray-500 font-normal select-none shadow-sm w-full">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#009688] text-white flex items-center justify-center font-bold text-xs">
            B
          </div>
          <span className="text-[14px] text-[#333333]">Open with an app</span>
        </div>
        <a
          href="/bruzoo_1.0.0.apk"
          download="app.apk"
          className="text-[#4e4e4e] hover:text-black cursor-pointer p-1 text-decoration-none flex items-center gap-1"
        >
          <span className="material-icons-outlined text-[20px]">file_download</span>
        </a>
      </section>

      {/* Main welcome titles matching bruzoo.games indexs.vue */}
      <section className="py-6 text-center select-none flex flex-col gap-1 bg-white w-full border-b border-gray-100">
        <h1 className="text-[24px] font-normal leading-tight text-[#009688] m-0">
          Welcome Back
        </h1>
        <span className="text-[14px] text-[#8A8A8A] font-normal leading-normal mt-1">
          Quality Guarantee
        </span>
      </section>

      {/* Image Banner Carousel */}
      <section className="w-full aspect-[16/9] bg-gray-900 relative overflow-hidden select-none border-b border-gray-200">
        <img
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80"
          alt="Banner"
          className="w-full h-full object-cover opacity-90"
        />
      </section>

      {/* 2-Column Product Grid list matching indexs.vue */}
      <section className="p-3 flex flex-col gap-3 w-full">
        <div className="grid grid-cols-2 gap-3 w-full">
          {PRODUCTS.map((p) => (
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
        </div>
      </section>

      <BottomNav />
    </main>
  );
}