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
      <section className="bg-[#F2F2F2] border-b border-gray-300 h-[50px] flex items-center justify-center text-xs font-normal select-none w-full relative">
        <img src="/logo.jpg" alt="Logo" className="h-[40px] w-auto max-w-[120px] object-contain absolute left-2" />
        <span className="text-[14px] text-[#666666]">Open with an app</span>
        <a
          href="/luvomall_1.0.0.apk"
          download="app.apk"
          className="text-[#666666] hover:text-black cursor-pointer p-1 text-decoration-none flex items-center absolute right-3"
        >
          <span className="material-icons-outlined text-[24px]">file_download</span>
        </a>
      </section>

      {/* Main welcome titles matching luvomall.games indexs.vue */}
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
      <section className="w-full bg-white p-[15px] box-border" style={{ boxShadow: "rgba(0, 0, 0, 0.2) 0px 3px 1px -2px, rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px" }}>
        <div className="flex flex-wrap w-full">
          {PRODUCTS.map((p) => (
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
        </div>
      </section>

      <BottomNav />
    </main>
  );
}