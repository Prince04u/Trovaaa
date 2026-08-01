"use client";

import Link from "next/link";
import BottomNav from "./BottomNav";

const PRODUCTS = [
  {
    id: 1,
    title: "【 Now 】 Series White 18K Gold Pair Ring",
    price: "38570.00",
    image: "https://art.apex-king.com/uploads/images/51iEBQzCL5L._UL1500_.jpg"
  },
  {
    id: 2,
    title: "【Cute Pet】 Series Rose 18K Gold Pearl Pendant",
    price: "2899.00",
    image: "https://art.apex-king.com/uploads/images/71JvL64Y3cL._UY695_.jpg"
  },
  {
    id: 3,
    title: "18K Gold Diamond Ruby Deer Horn Collar Chain",
    price: "4559.00",
    image: "https://art.apex-king.com/uploads/images/71YWzTc2omL._UY695_.jpg"
  },
  {
    id: 4,
    title: "Enzo Jewelry 14k Gold Seven Colored Gemstone Pendant",
    price: "5599.00",
    image: "https://art.apex-king.com/uploads/images/4.jpg"
  },
  {
    id: 5,
    title: "Sukkhi Gleaming Pearl Gold Plated Wedding Jewellery Kundan Peacock Meenakari Multi-String Necklace",
    price: "1745.00",
    image: "https://art.apex-king.com/uploads/images/5.jpg"
  },
  {
    id: 6,
    title: "Ananth Jewels 925 Sterling Silver BIS Hallmarked Heart Bracelet for Women",
    price: "9000.00",
    image: "https://art.apex-king.com/uploads/images/6.jpg"
  },
  {
    id: 7,
    title: "Handicraft Kottage ® 1gm 22Ct Gold Plated Pendant and Chain for Men/Women/Girls",
    price: "999.00",
    image: "https://art.apex-king.com/uploads/images/7.jpg"
  },
  {
    id: 8,
    title: "Mansiyaorange Combo of Two Party One Gram Gold Forming Long Haram and Choker Set",
    price: "3199.00",
    image: "https://art.apex-king.com/uploads/images/8.jpg"
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
          src="https://apex-king.com/img/img1.a0c0ceb8.jpg"
          alt="Banner"
          className="w-full h-full object-cover opacity-90"
        />
      </section>

      {/* 2-Column Product Grid list matching indexs.vue */}
      <section className="p-1 flex flex-col gap-2 w-full">
        <div className="grid grid-cols-2 gap-2 w-full px-1">
          {PRODUCTS.map((p) => (
            <Link
              key={p.id}
              href={`/product?goodsId=${p.id}`}
              className="bg-white rounded-[2px] flex flex-col text-decoration-none transition-colors"
              style={{ boxShadow: "rgba(0, 0, 0, 0.2) 0px 3px 1px -2px, rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px" }}
            >
              <div className="p-2 w-full">
                <div
                  className="w-full aspect-square bg-[#fff] bg-cover bg-center"
                  style={{ backgroundImage: `url(${p.image})` }}
                />
              </div>

              <h3 className="text-[14px] text-[rgba(0,0,0,0.87)] font-normal line-clamp-3 leading-tight select-none overflow-hidden text-ellipsis m-0 px-2 pb-1">
                {p.title}
              </h3>

              <strong className="text-[14px] text-[#f39839] font-medium select-none leading-none px-2 pb-2">
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