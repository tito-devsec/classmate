import { useEffect, useState } from "react";
import { schools } from "@/data/schools";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import hero4 from "@/assets/hero-4.jpg";
import hero5 from "@/assets/hero-5.jpg";

interface Slide {
  src: string;
  caption: string;
}

/** Every distinct campus photo in the catalogue, captioned with the school it belongs to. */
function buildSlides(): Slide[] {
  const seen = new Set<string>();
  const slides: Slide[] = [];

  for (const school of schools) {
    if (seen.has(school.image)) continue;
    seen.add(school.image);
    slides.push({ src: school.image, caption: `${school.name} · ${school.location}` });
  }

  const campus: Slide[] = [
    { src: hero1, caption: "Wanafunzi wakiwa shuleni" },
    { src: hero2, caption: "Darasani" },
    { src: hero3, caption: "Maabara ya sayansi" },
    { src: hero4, caption: "Uwanja wa michezo" },
    { src: hero5, caption: "Maabara ya kompyuta" },
  ];

  // Alternate campus life with school buildings so consecutive slides always differ.
  const mixed: Slide[] = [];
  const longest = Math.max(slides.length, campus.length);
  for (let index = 0; index < longest; index += 1) {
    if (slides[index]) mixed.push(slides[index]);
    if (campus[index]) mixed.push(campus[index]);
  }
  return mixed;
}

const SLIDES = buildSlides();
const INTERVAL = 5500;

interface HeroSliderProps {
  className?: string;
}

/**
 * Background slideshow for the home hero: real school photos crossfading with a slow zoom,
 * a scrim so the headline stays legible, and a caption naming the school on screen.
 */
export function HeroSlider({ className = "" }: HeroSliderProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || SLIDES.length < 2) return undefined;
    const timer = setInterval(() => setIndex((value) => (value + 1) % SLIDES.length), INTERVAL);
    return () => clearInterval(timer);
  }, [paused]);

  useEffect(() => {
    // Warm the next image so the crossfade never flashes a half-loaded photo.
    const next = new Image();
    next.src = SLIDES[(index + 1) % SLIDES.length].src;
  }, [index]);

  return (
    <div
      className={`absolute inset-0 overflow-hidden bg-secondary ${className}`}
      aria-hidden="true"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {SLIDES.map((slide, position) => {
        const active = position === index;
        return (
          <img
            key={slide.src + position}
            src={slide.src}
            alt=""
            loading={position === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ease-in-out ${
              active ? "opacity-100" : "opacity-0"
            }`}
            style={active ? { animation: "slowZoom 7s ease-out forwards" } : undefined}
          />
        );
      })}

      {/* Scrim: dark enough for white type, light enough to keep the photo. */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.62)_0%,rgba(0,0,0,0.5)_55%,rgba(0,0,0,0.7)_100%)]" />

      {/* Caption + progress dots */}
      <div className="wrap absolute inset-x-0 bottom-5 flex items-center justify-between gap-4 text-white/85">
        <span className="truncate text-[13px] font-medium drop-shadow">{SLIDES[index]?.caption}</span>
        <span className="flex shrink-0 items-center gap-1.5">
          {SLIDES.map((slide, position) => (
            <button
              key={slide.src + position}
              type="button"
              tabIndex={-1}
              onClick={() => setIndex(position)}
              className={`h-1.5 rounded-full transition-all ${position === index ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
