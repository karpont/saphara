"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Coklu resim/video swipe carousel (Instagram tarzi). */
export function Carousel({ urls }: { urls: string[] }) {
  const [i, setI] = useState(0);
  if (!urls || urls.length === 0) return null;
  if (urls.length === 1) return <img className="post-media" src={urls[0]} alt="" />;

  const isVideo = (u: string) => /\.(mp4|webm|mov)$/i.test(u);

  return (
    <div className="carousel">
      <div className="carousel-track">
        {isVideo(urls[i])
          ? <video src={urls[i]} controls className="post-media" />
          : <img className="post-media" src={urls[i]} alt={`${i + 1}/${urls.length}`} />}
      </div>
      {i > 0 && <button className="car-nav left" onClick={() => setI(i - 1)}><ChevronLeft size={20} /></button>}
      {i < urls.length - 1 && <button className="car-nav right" onClick={() => setI(i + 1)}><ChevronRight size={20} /></button>}
      <div className="car-dots">
        {urls.map((_, j) => <span key={j} className={j === i ? "dot on" : "dot"} />)}
      </div>
    </div>
  );
}
