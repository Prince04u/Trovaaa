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
      <section className="bg-[#f2f2f2] h-[50px] flex items-center justify-between text-xs font-normal select-none w-full relative z-10 px-[15px]" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>
        <img src="/logo.png" alt="Logo" className="h-[74px] w-auto object-contain" />
        <span className="text-[14px] text-[#666666] absolute left-1/2 -translate-x-1/2">Open with an app</span>
        <a
          href="/luvomall_1.0.0.apk"
          download="app.apk"
          className="cursor-pointer flex items-center"
        >
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAADF0lEQVRoQ+1aO2gUURQ9Nx8mYCfYiR+w0EbsTMD4qyVqwA/aGBG7FUdm3jYBYxOYeS+OmE6IBoL4Az9gk8L4BbVSUlkIiXY2dkKEZK9MSGR8O7PzdXeKmXLn3nvOub/d91hCwse2bU5oWqiZlJKSBExk5AeqhCRJZwubqiJRySl9a3WKYM6Oa3KnSkjRKc0Zr6pIzgQW7h5akbDd3alZSsqlElJ4b0QETFORTwD2BON0dXVtdRzne/CzsrRWvV7f0mg0vmm6P/utdQfAOU3IoOM470oqZF+j0XirCZn2hQgAjvbikZTyZBmF2Lb9EMAJjW+dhBBDzPxMb1EiOu+6rl+t1acMrSWEGGHm2yFcj66eRyzLek1E+zWDX8x8RCn1qgxCLMs6SETPAWwI8mTmN0qpA+tCjhPR45DFsUBEV1zXfdrJigghjjHzdQDbdY7MPKyUevL3hGjb9n0ApyK2oD9cg+1auRpOK+wHUsrTvv1fIUKIfmZ+3yGymWCJaMB13Q//CFmblb1EdAvA7kyR2+c0z8wXlVIf1yGbLh9M09zY09NzE8DZ9vFKhXR3eXn5kud5P4NekbcolmVdBXA4ZJulQi3K2N9OAOaUUtfCYsZeB5mmuaO7u/vQmqjVwWrXw8z+AppbWVl56Xne11a4sUKCzrZtLwDY1iYhi1LKpnUbhZ1KSNQ36/8Qpv+yiMNIJaRWqxl9fX1f2lCVxaWlpZ2Tk5O/4wREbq04R38JENFYnF2e98w8FjXUhbTWehAhhMfMl/OQjSREdMN1XTNt7FStpQ1+0zkmLXiI/bSUciRLnMxCfLCwQ1kWEr4PM08ppS5k9c8lxAe1LOsMEY0C2JWFBDPPMrM3MTExm8U/87CHgdVqtU2GYYwS0TCAzQkJvWDme0qpqYT2Lc1yVyQY3V/PhmEMEFE/gAEAQxr6PICZ3t7emfHx8R9FCCi0ImGEwtZ0lrWaVGyhFQmCVkKSlkCzqyoSl7iqteIyFPG+aq24xFWtFZehqrVaZKjoa9Skf9cIo5Rr2CshEVWuKhK8xM6yLMrUWn8AMZSO49QGBtUAAAAASUVORK5CYII=" alt="download" className="w-[18px] h-[18px] opacity-70" />
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

      {/* Image Banner */}
      <section className="w-full bg-white relative select-none border-b border-gray-200 flex justify-center">
        <img
          src="https://apex-king.com/img/img1.a0c0ceb8.jpg"
          alt="Banner"
          className="w-full h-auto block"
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