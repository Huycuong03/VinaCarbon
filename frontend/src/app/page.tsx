"use client";

import { useSession } from "next-auth/react";

import { NavBar, SearchBar } from "@/components/common";

import { ArrowRight } from "lucide-react";
import { FEATURED_ARTICLES, Page } from "@/constants";


export default function Home() {
  const { data: session, status } = useSession();
  return (
    <div className="min-h-screen flex flex-col font-sans text-[#333333] bg-[#F5F1EA]">
      <NavBar page={`${Page.HOME}`} user={session?.user}/>
      <div className="animate-fade-in">
        <section className="relative h-[80vh] flex items-center justify-center text-center overflow-hidden">
          <div className="absolute inset-0">
            <img src="https://picsum.photos/1920/1080?random=hero" alt="Vietnam Landscape" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1C3D2A]/60 via-[#1C3D2A]/30 to-[#F5F1EA]"></div>
          </div>
          <div className="relative z-10 max-w-4xl px-4 w-full">
            <h1 className="text-5xl md:text-7xl font-serif text-white font-bold mb-6 leading-tight drop-shadow-lg">
              Unlock the Value <br /> of Your Land
            </h1>
            <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto font-sans font-light">
              Join the carbon market revolution. Analyze your farm, understand your potential, and connect with a sustainable future.
            </p>
            <SearchBar query={null}/>
          </div>
        </section>

        <section className="py-20 px-6 md:px-12 bg-[#F5F1EA]">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-forest font-serif text-4xl font-bold mb-2">Featured Stories</h2>
                <p className="text-[#333333]/70">Insights from the field and carbon market updates.</p>
              </div>
              <button className="text-forest font-bold hover:underline flex items-center gap-1">View All <ArrowRight size={16} /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {FEATURED_ARTICLES.map((article) => (
                <div key={article.id} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-xl aspect-[4/3] mb-4">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold uppercase tracking-wider text-forest rounded-sm">
                      {article.category}
                    </div>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-forest mb-2 group-hover:text-earth transition-colors">{article.title}</h3>
                  <p className="text-[#333333]/80 mb-3 line-clamp-2">{article.excerpt}</p>
                  <span className="text-xs text-gray-500 font-medium">{article.readTime}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
