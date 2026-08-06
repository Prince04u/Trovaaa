"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BottomNav from "@/components/home/BottomNav";

const PRODUCTS_DATA = {
  "1": {
    "id": 1,
    "title": "Joyalukkas 18k (750) Rose Gold and Solitaire Pendant for Girls",
    "price": "38576.00",
    "images": [
      "https://art.apex-king.com/uploads/images/51iEBQzCL5L._UL1500_.jpg",
      "https://art.apex-king.com/uploads/images/61Jbfg9PtkL._UL1500_.jpg",
      "https://art.apex-king.com/uploads/images/61Wk6JmMvaL._UL1500_.jpg"
    ],
    "specs": {
      "Brand": "Ananth Jewels",
      "Collection": "Ananth Jewels 925 Silver BIS Hallmark Collection",
      "Stone": "Cubic Zirconia",
      "Resizable?": "Y",
      "Material": "sterling-silver",
      "Metal": "Stamp 925-Sterling",
      "Metal ": "Silver",
      "Model Number": "SLB069",
      "Packaging": "Comes with a Case for Gifting",
      "Stone Shape": "Round",
      "Stone Colour": "Clear",
      "Stone Clarity": "FL",
      "Stone Cut": "deal",
      "Inscription": "925"
}
  },
  "2": {
    "id": 2,
    "title": "Ratnavali Jewels American Diamond Traditional Fashion Jewellery Green Necklace Pendant Set with Earring for Women/Girls RV2916G",
    "price": "2899.00",
    "images": [
      "https://art.apex-king.com/uploads/images/71JvL64Y3cL._UY695_.jpg",
      "https://art.apex-king.com/uploads/images/71rXzGEk8uL._UY695_.jpg"
    ],
    "specs": {
      "Brand": "Ananth Jewels",
      "Collection": "Ananth Jewels 925 Silver BIS Hallmark Collection",
      "Stone": "Cubic Zirconia",
      "Resizable?": "Y",
      "Material": "sterling-silver",
      "Metal": "Stamp 925-Sterling",
      "Metal ": "Silver",
      "Model Number": "SLB069",
      "Packaging": "Comes with a Case for Gifting",
      "Stone Shape": "Round",
      "Stone Colour": "Clear",
      "Stone Clarity": "FL",
      "Stone Cut": "deal",
      "Inscription": "925"
}
  },
  "3": {
    "id": 3,
    "title": "Swasti Jewels Heart Shape Fashion Jewellery Set Pendant Earrings for Women",
    "price": "4559.00",
    "images": [
      "https://art.apex-king.com/uploads/images/71YWzTc2omL._UY695_.jpg",
      "https://art.apex-king.com/uploads/images/715ltZ1SJtL._UY695_.jpg"
    ],
    "specs": {
      "Brand": "Ananth Jewels",
      "Collection": "Ananth Jewels 925 Silver BIS Hallmark Collection",
      "Stone": "Cubic Zirconia",
      "Resizable?": "Y",
      "Material": "sterling-silver",
      "Metal": "Stamp 925-Sterling",
      "Metal ": "Silver",
      "Model Number": "SLB069",
      "Packaging": "Comes with a Case for Gifting",
      "Stone Shape": "Round",
      "Stone Colour": "Clear",
      "Stone Clarity": "FL",
      "Stone Cut": "deal",
      "Inscription": "925"
}
  },
  "4": {
    "id": 4,
    "title": "Om Jewells Rhodium Plated Blue Crystal Jewellery Combo of Designer Drop Pendant Set with Adjustable Bangle Kada and Adjustable Solitaire Finger Ring for Girls and Women CO1000209",
    "price": "1599.00",
    "images": [
      "https://art.apex-king.com/uploads/images/4.jpg"
    ],
    "specs": {
      "Brand": "Ananth Jewels",
      "Collection": "Ananth Jewels 925 Silver BIS Hallmark Collection",
      "Stone": "Cubic Zirconia",
      "Resizable?": "Y",
      "Material": "sterling-silver",
      "Metal": "Stamp 925-Sterling",
      "Metal ": "Silver",
      "Model Number": "SLB069",
      "Packaging": "Comes with a Case for Gifting",
      "Stone Shape": "Round",
      "Stone Colour": "Clear",
      "Stone Clarity": "FL",
      "Stone Cut": "deal",
      "Inscription": "925"
}
  },
  "5": {
    "id": 5,
    "title": "Sukkhi Gleaming Pearl Gold Plated Wedding Jewellery Kundan Peacock Meenakari Multi-String Necklace Set for Women (2191NGLDPP1560)",
    "price": "1745.00",
    "images": [
      "https://art.apex-king.com/uploads/images/5.jpg",
      "https://art.apex-king.com/uploads/images/5_1.jpg"
    ],
    "specs": {
      "Brand": "Ananth Jewels",
      "Collection": "Ananth Jewels 925 Silver BIS Hallmark Collection",
      "Stone": "Cubic Zirconia",
      "Resizable?": "Y",
      "Material": "sterling-silver",
      "Metal": "Stamp 925-Sterling",
      "Metal ": "Silver",
      "Model Number": "SLB069",
      "Packaging": "Comes with a Case for Gifting",
      "Stone Shape": "Round",
      "Stone Colour": "Clear",
      "Stone Clarity": "FL",
      "Stone Cut": "deal",
      "Inscription": "925"
}
  },
  "6": {
    "id": 6,
    "title": "Ananth Jewels 925 Sterling Silver BIS Hallmarked Heart Bracelet for Women",
    "price": "9000.00",
    "images": [
      "https://art.apex-king.com/uploads/images/6.jpg",
      "https://art.apex-king.com/uploads/images/6_1.jpg"
    ],
    "specs": {
      "Brand": "Ananth Jewels",
      "Collection": "Ananth Jewels 925 Silver BIS Hallmark Collection",
      "Stone": "Cubic Zirconia",
      "Resizable?": "Y",
      "Material": "sterling-silver",
      "Metal": "Stamp 925-Sterling",
      "Metal ": "Silver",
      "Model Number": "SLB069",
      "Packaging": "Comes with a Case for Gifting",
      "Stone Shape": "Round",
      "Stone Colour": "Clear",
      "Stone Clarity": "FL",
      "Stone Cut": "deal",
      "Inscription": "925"
}
  },
  "7": {
    "id": 7,
    "title": "Handicraft Kottage ® 1gm 22Ct Gold Plated Pendant and Chain for Men/Women/Girls",
    "price": "999.00",
    "images": [
      "https://art.apex-king.com/uploads/images/7.jpg"
    ],
    "specs": {
      "Brand": "Ananth Jewels",
      "Collection": "Ananth Jewels 925 Silver BIS Hallmark Collection",
      "Stone": "Cubic Zirconia",
      "Resizable?": "Y",
      "Material": "sterling-silver",
      "Metal": "Stamp 925-Sterling",
      "Metal ": "Silver",
      "Model Number": "SLB069",
      "Packaging": "Comes with a Case for Gifting",
      "Stone Shape": "Round",
      "Stone Colour": "Clear",
      "Stone Clarity": "FL",
      "Stone Cut": "deal",
      "Inscription": "925"
}
  },
  "8": {
    "id": 8,
    "title": "Mansiyaorange Combo of Two Party One Gram Gold Forming Long Haram and Choker Multi Color Jewellery Necklace/Juelry/jwelry Set Jewellery for Women",
    "price": "3199.00",
    "images": [
      "https://art.apex-king.com/uploads/images/8.jpg",
      "https://art.apex-king.com/uploads/images/8_1.jpg"
    ],
    "specs": {
      "Brand": "Ananth Jewels",
      "Collection": "Ananth Jewels 925 Silver BIS Hallmark Collection",
      "Stone": "Cubic Zirconia",
      "Resizable?": "Y",
      "Material": "sterling-silver",
      "Metal": "Stamp 925-Sterling",
      "Metal ": "Silver",
      "Model Number": "SLB069",
      "Packaging": "Comes with a Case for Gifting",
      "Stone Shape": "Round",
      "Stone Colour": "Clear",
      "Stone Clarity": "FL",
      "Stone Cut": "deal",
      "Inscription": "925"
}
  },
  "9": {
    "id": 9,
    "title": "Young & Forever Fashion Jewellery Elite Rose Gold Plated Geometric Shape Stud Earring Pendant Set for Women Princess Length Delicate Chain Cubic Zirconia Necklace Set for Girls Jewelry",
    "price": "4450.00",
    "images": [
      "https://art.apex-king.com/uploads/images/9.jpg"
    ],
    "specs": {
      "Brand": "Ananth Jewels",
      "Collection": "Ananth Jewels 925 Silver BIS Hallmark Collection",
      "Stone": "Cubic Zirconia",
      "Resizable?": "Y",
      "Material": "sterling-silver",
      "Metal": "Stamp 925-Sterling",
      "Metal ": "Silver",
      "Model Number": "SLB069",
      "Packaging": "Comes with a Case for Gifting",
      "Stone Shape": "Round",
      "Stone Colour": "Clear",
      "Stone Clarity": "FL",
      "Stone Cut": "deal",
      "Inscription": "925"
}
  },
  "10": {
    "id": 10,
    "title": "Ratnavali Jewels American Diamond Cz Gold Plated Necklace Set Tennis Necklace Single Line Solitaire Set With Chain & Earring For Women",
    "price": "4000.00",
    "images": [
      "https://art.apex-king.com/uploads/images/10.jpg",
      "https://art.apex-king.com/uploads/images/10_1.jpg"
    ],
    "specs": {
      "Brand": "Ananth Jewels",
      "Collection": "Ananth Jewels 925 Silver BIS Hallmark Collection",
      "Stone": "Cubic Zirconia",
      "Resizable?": "Y",
      "Material": "sterling-silver",
      "Metal": "Stamp 925-Sterling",
      "Metal ": "Silver",
      "Model Number": "SLB069",
      "Packaging": "Comes with a Case for Gifting",
      "Stone Shape": "Round",
      "Stone Colour": "Clear",
      "Stone Clarity": "FL",
      "Stone Cut": "deal",
      "Inscription": "925"
}
  },
  "11": {
    "id": 11,
    "title": "chandrika pearls gems & jewellers Sania Mirza Style Without Piercing Clip on Pressing Type Nose Ring for Women & Girls",
    "price": "278.00",
    "images": [
      "https://art.apex-king.com/uploads/images/11.jpg",
      "https://art.apex-king.com/uploads/images/11_1.jpg",
      "https://art.apex-king.com/uploads/images/11_2.jpg"
    ],
    "specs": {
      "Brand": "Ananth Jewels",
      "Collection": "Ananth Jewels 925 Silver BIS Hallmark Collection",
      "Stone": "Cubic Zirconia",
      "Resizable?": "Y",
      "Material": "sterling-silver",
      "Metal": "Stamp 925-Sterling",
      "Metal ": "Silver",
      "Model Number": "SLB069",
      "Packaging": "Comes with a Case for Gifting",
      "Stone Shape": "Round",
      "Stone Colour": "Clear",
      "Stone Clarity": "FL",
      "Stone Cut": "deal",
      "Inscription": "925"
}
  },
  "12": {
    "id": 12,
    "title": "Chandrika Pearls Gems & Jewellers Sterling Silver Pendant Earring with Swarovski Crystal for Girls",
    "price": "1060.00",
    "images": [
      "https://art.apex-king.com/uploads/images/12.jpg",
      "https://art.apex-king.com/uploads/images/12_1.jpg"
    ],
    "specs": {
      "Brand": "Ananth Jewels",
      "Collection": "Ananth Jewels 925 Silver BIS Hallmark Collection",
      "Stone": "Cubic Zirconia",
      "Resizable?": "Y",
      "Material": "sterling-silver",
      "Metal": "Stamp 925-Sterling",
      "Metal ": "Silver",
      "Model Number": "SLB069",
      "Packaging": "Comes with a Case for Gifting",
      "Stone Shape": "Round",
      "Stone Colour": "Clear",
      "Stone Clarity": "FL",
      "Stone Cut": "deal",
      "Inscription": "925"
}
  },
  "13": {
    "id": 13,
    "title": "Chandrika Pearls Gems & Jewellers 92.5 Sterling Silver Real Diamond Valentine Crown King Queen Ring for Girls & Women",
    "price": "1920.00",
    "images": [
      "https://art.apex-king.com/uploads/images/13.jpg",
      "https://art.apex-king.com/uploads/images/13_1.jpg"
    ],
    "specs": {
      "Brand": "Ananth Jewels",
      "Collection": "Ananth Jewels 925 Silver BIS Hallmark Collection",
      "Stone": "Cubic Zirconia",
      "Resizable?": "Y",
      "Material": "sterling-silver",
      "Metal": "Stamp 925-Sterling",
      "Metal ": "Silver",
      "Model Number": "SLB069",
      "Packaging": "Comes with a Case for Gifting",
      "Stone Shape": "Round",
      "Stone Colour": "Clear",
      "Stone Clarity": "FL",
      "Stone Cut": "deal",
      "Inscription": "925"
}
  },
  "14": {
    "id": 14,
    "title": "Chandrika Pearls Gems & Jewellers 925 Pure Sterling Silver Letters Initial Pendant with Gold Polish (R)",
    "price": "476.00",
    "images": [
      "https://art.apex-king.com/uploads/images/14.jpg"
    ],
    "specs": {
      "Brand": "Ananth Jewels",
      "Collection": "Ananth Jewels 925 Silver BIS Hallmark Collection",
      "Stone": "Cubic Zirconia",
      "Resizable?": "Y",
      "Material": "sterling-silver",
      "Metal": "Stamp 925-Sterling",
      "Metal ": "Silver",
      "Model Number": "SLB069",
      "Packaging": "Comes with a Case for Gifting",
      "Stone Shape": "Round",
      "Stone Colour": "Clear",
      "Stone Clarity": "FL",
      "Stone Cut": "deal",
      "Inscription": "925"
}
  },
  "15": {
    "id": 15,
    "title": "Chandrika Pearls Gems & Jewellers Dhanteras Brass Hindu Puja Camphor Burner Lamp Panch Aarti - 5 Face For Puja",
    "price": "1880.00",
    "images": [
      "https://art.apex-king.com/uploads/images/15.jpg",
      "https://art.apex-king.com/uploads/images/15_1.jpg"
    ],
    "specs": {
      "Brand": "Ananth Jewels",
      "Collection": "Ananth Jewels 925 Silver BIS Hallmark Collection",
      "Stone": "Cubic Zirconia",
      "Resizable?": "Y",
      "Material": "sterling-silver",
      "Metal": "Stamp 925-Sterling",
      "Metal ": "Silver",
      "Model Number": "SLB069",
      "Packaging": "Comes with a Case for Gifting",
      "Stone Shape": "Round",
      "Stone Colour": "Clear",
      "Stone Clarity": "FL",
      "Stone Cut": "deal",
      "Inscription": "925"
}
  },
  "16": {
    "id": 16,
    "title": "Jewels Galaxy Designer American Diamond Gold Plated Bangles for Women/Girls",
    "price": "1999.00",
    "images": [
      "https://art.apex-king.com/uploads/images/16.jpg",
      "https://art.apex-king.com/uploads/images/16_1.jpg"
    ],
    "specs": {
      "Brand": "Ananth Jewels",
      "Collection": "Ananth Jewels 925 Silver BIS Hallmark Collection",
      "Stone": "Cubic Zirconia",
      "Resizable?": "Y",
      "Material": "sterling-silver",
      "Metal": "Stamp 925-Sterling",
      "Metal ": "Silver",
      "Model Number": "SLB069",
      "Packaging": "Comes with a Case for Gifting",
      "Stone Shape": "Round",
      "Stone Colour": "Clear",
      "Stone Clarity": "FL",
      "Stone Cut": "deal",
      "Inscription": "925"
}
  }
};

function ProductDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const goodsId = searchParams.get("goodsId") || "1";

  const product = PRODUCTS_DATA[goodsId] || {
    id: goodsId,
    title: "Fashion Jewellery Product",
    price: "1999.00",
    images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"],
    specs: {
      "Brand": "Jewellery Brand",
      "Material": "Gold Plated",
      "Qty": "1",
      "Warranty Description": "Manufacturer Warranty"
    }
  };

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.clientWidth;
    const index = Math.round(scrollLeft / width);
    setCurrentImageIndex(index);
  };

  return (
    <main className="min-h-screen bg-[#f5f5f5] pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#222222]">
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
      {/* Top Navbar */}
      <nav className="bg-[#009688] text-white h-[50px] px-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm w-full">
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-transparent border-none text-white cursor-pointer p-0 flex items-center"
        >
          <span className="material-icons-outlined text-[24px]">arrow_back</span>
        </button>
        <span className="text-[17px] font-normal text-white">Product</span>
      </nav>

      {/* Product Image Carousel */}
      <div className="w-full bg-white relative">
        <div 
          className="w-full aspect-square flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
          onScroll={handleScroll}
          style={{ scrollBehavior: 'smooth', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
        >
          {product.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${product.title} ${idx + 1}`}
              className="w-full h-full object-contain flex-shrink-0 snap-center"
            />
          ))}
        </div>
        
        {/* Pagination Dots */}
        <div className="w-full bg-gray-500 py-2.5 flex justify-center items-center gap-3">
          {product.images.map((_, idx) => (
            <div
              key={idx}
              className={`rounded-full transition-all duration-300 ${
                idx === currentImageIndex 
                  ? "w-2.5 h-2.5 bg-[#ccc] border border-[#aaa]" 
                  : "w-2.5 h-2.5 bg-[#e0e0e0] border border-[#ccc]"
              }`}
              style={{
                opacity: idx === currentImageIndex ? 1 : 0.6
              }}
            />
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 bg-white flex flex-col gap-3">
        <p className="text-[13px] text-gray-800 font-normal m-0 leading-snug">{product.title}</p>
        <p className="text-[15px] text-[#F9A825] font-normal m-0">₹ {product.price}</p>
        <div>
          <button
            type="button"
            disabled
            className="bg-[#e0e0e0] text-[#9e9e9e] px-4 py-1.5 rounded-[3px] text-[12px] border-none cursor-not-allowed"
          >
            Sold Out
          </button>
        </div>
      </div>

      {/* Specifications Table */}
      <div className="bg-white mt-[10px] pb-4">
        <h3 className="text-[13px] font-normal text-gray-400 m-0 px-4 py-4">
          Product Specifications
        </h3>
        <div className="w-full">
          {Object.entries(product.specs).map(([key, val], i) => (
            <div key={i} className="flex px-4 py-4 border-t border-[#f5f5f5]">
              <div className="w-1/3 text-[13px] text-gray-800">{key}</div>
              <div className="w-2/3 text-[13px] text-gray-800">{val}</div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </main>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafafa] flex items-center justify-center text-gray-400">Loading...</div>}>
      <ProductDetailsContent />
    </Suspense>
  );
}
