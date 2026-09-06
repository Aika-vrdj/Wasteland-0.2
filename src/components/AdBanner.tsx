import React, { useEffect, useState } from 'react';

// Each slide can carry an optional link for later — leave `href` as null
// until you're ready to make a slide clickable, then it wraps itself in
// an <a> automatically, no other changes needed.
interface AdSlide {
  image: string;
  href: string | null;
}

const BUCKET_URL = 'https://twyfuamtvdbtbnvbalbe.supabase.co/storage/v1/object/public/site-banners';

const SLIDES: AdSlide[] = [
  { image: `${BUCKET_URL}/1.png`, href: null },
  { image: `${BUCKET_URL}/2.png`, href: null },
  { image: `${BUCKET_URL}/3.png`, href: null },
  { image: `${BUCKET_URL}/4.png`, href: null },
];

const ROTATE_MS = 10000;

export function AdBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex(i => (i + 1) % SLIDES.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex justify-center">
      <div
        className="relative w-full scav-panel overflow-hidden"
        style={{ maxWidth: 728, aspectRatio: '728 / 120' }}
      >
        {SLIDES.map((slide, i) => {
          const content = (
            <img
              src={slide.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
              style={{ opacity: i === index ? 1 : 0 }}
            />
          );
          return slide.href ? (
            <a key={slide.image} href={slide.href} target="_blank" rel="noopener noreferrer">
              {content}
            </a>
          ) : (
            <React.Fragment key={slide.image}>{content}</React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
