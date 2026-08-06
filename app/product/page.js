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
      "Brand": "Apex",
      "Qty": "1"
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
      "Brand": "Apex",
      "Qty": "1"
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
      "Brand": "Apex",
      "Qty": "1"
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
      "Brand": "Apex",
      "Qty": "1"
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
      "Brand": "Apex",
      "Qty": "1"
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
      "Brand": "Apex",
      "Qty": "1"
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
      "Brand": "Apex",
      "Qty": "1"
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
      "Brand": "Apex",
      "Qty": "1"
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
      "Brand": "Apex",
      "Qty": "1"
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
      "Brand": "Apex",
      "Qty": "1"
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
      "Brand": "Apex",
      "Qty": "1"
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
      "Brand": "Apex",
      "Qty": "1"
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
      "Brand": "Apex",
      "Qty": "1"
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
      "Brand": "Apex",
      "Qty": "1"
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
      "Brand": "Apex",
      "Qty": "1"
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
      "Brand": "Apex",
      "Qty": "1"
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

  useEffect(() => {
    if (!product.images || product.images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [product.images]);

  return (
    <main className="min-h-screen bg-[#fafafa] pb-24 flex flex-col w-full max-w-none m-0 relative select-none text-[#222222]">
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
      <div className="w-full aspect-square bg-[#f0f0f0] relative overflow-hidden">
        {product.images.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`${product.title} ${idx + 1}`}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
            style={{
              opacity: idx === currentImageIndex ? 1 : 0,
              zIndex: idx === currentImageIndex ? 1 : 0,
            }}
          />
        ))}
      </div>

      {/* Product Info */}
      <div className="p-4 bg-white border-b border-gray-200 flex flex-col gap-2">
        <p className="text-[16px] text-gray-800 font-normal m-0 leading-snug">{product.title}</p>
        <p className="text-[20px] text-[#E65100] font-bold m-0">₹ {product.price}</p>
        <button
          type="button"
          onClick={() => router.push('/recharge')}
          className="mt-2 bg-[#2196f3] text-white py-3 rounded font-medium text-[15px] border-none w-full cursor-pointer"
        >
          Buy Now
        </button>
      </div>

      {/* Specifications Table */}
      <div className="p-4 bg-white mt-3 border-t border-b border-gray-200">
        <h3 className="text-[16px] font-medium text-[#333333] m-0 mb-3 pb-2 border-b border-gray-100">
          Product Specifications
        </h3>
        <table className="w-full text-[14px]">
          <tbody>
            {Object.entries(product.specs).map(([key, val]) => (
              <tr key={key} className="border-b border-gray-100">
                <td className="py-2.5 text-gray-500 font-normal w-1/3">{key}</td>
                <td className="py-2.5 text-gray-800 font-normal">{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
