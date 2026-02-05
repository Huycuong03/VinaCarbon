"use client";
import { SearchBar } from "@/components/common";


export default function Home() {
  return (
    <div className="flex flex-1 flex-col font-sans text-charcoal bg-sand overflow-hidden animate-fade-in">
      <section className="relative flex-1 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://picsum.photos/1920/1080?random=hero"
            alt="Vietnam Landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-forest/60 via-forest/30 to-sand"></div>
        </div>

        <div className="relative z-10 max-w-4xl px-4 w-full text-center">
          <h1 className="text-5xl md:text-7xl font-serif text-white font-bold mb-6 leading-tight drop-shadow-lg">
            Cùng Bắt Đầu <br /> Hành Trình Xanh
          </h1>

          <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto font-sans font-extralight">
            Cùng tham gia cách mạng Carbon của Việt Nam. Phân tích tiềm năng của bạn, hiểu rõ giá trị và kết nối với một tương lai bền vững.
          </p>

          <SearchBar query={null} />
        </div>
      </section>
    </div>
  );
}

