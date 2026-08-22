import { useState, useEffect, useCallback, useRef } from 'react';

interface MonthData {
  key: string;
  label: string;
  fullLabel: string;
  desc: string;
  images: number[];
}

interface GalleryImage {
  src: string;
  alt: string;
}

const MONTHS: MonthData[] = [
  { key: 'jan', label: 'Jan', fullLabel: 'January',   desc: 'Snow-dusted orchards, frozen mornings, deep silence',          images: [0, 1, 4, 6, 2, 7] },
  { key: 'feb', label: 'Feb', fullLabel: 'February',  desc: 'Last snowfall of winter, first whispers of the spring thaw',   images: [1, 0, 5, 3, 7, 6] },
  { key: 'mar', label: 'Mar', fullLabel: 'March',     desc: 'Plum blossoms break the frost — the valley awakens',          images: [2, 3, 0, 4, 7, 1] },
  { key: 'apr', label: 'Apr', fullLabel: 'April',     desc: 'Apple and apricot blossoms in glorious full bloom',           images: [3, 2, 4, 5, 6, 0] },
  { key: 'may', label: 'May', fullLabel: 'May',       desc: 'Warm sunny days, lush green slopes, orchard in full leaf',    images: [4, 3, 2, 5, 6, 7] },
  { key: 'jun', label: 'Jun', fullLabel: 'June',      desc: 'The rains arrive — mist rolls gently over the peaks',         images: [4, 5, 3, 6, 2, 7] },
  { key: 'jul', label: 'Jul', fullLabel: 'July',      desc: 'Lush monsoon green, the river runs full and strong',          images: [5, 4, 6, 3, 2, 7] },
  { key: 'aug', label: 'Aug', fullLabel: 'August',    desc: 'Deep monsoon — emerald valley, waterfalls, cool mist',        images: [5, 4, 3, 6, 1, 2] },
  { key: 'sep', label: 'Sep', fullLabel: 'September', desc: 'Skies clear, mountain views return crisp and sharp',          images: [6, 5, 4, 7, 3, 2] },
  { key: 'oct', label: 'Oct', fullLabel: 'October',   desc: 'Apple harvest season — golden light, ripe orchards',         images: [6, 7, 5, 4, 3, 0] },
  { key: 'nov', label: 'Nov', fullLabel: 'November',  desc: 'Autumn gold, fallen leaves, woodsmoke in the evening air',   images: [7, 6, 1, 0, 4, 5] },
  { key: 'dec', label: 'Dec', fullLabel: 'December',  desc: 'First snows dust the high peaks, the valley grows quiet',    images: [0, 1, 7, 6, 5, 4] },
];

const GALLERY_IMAGES: GalleryImage[] = [
  { src: 'gallery/winter_1.jpg',   alt: 'Snow-covered wooden A-frame cottage surrounded by bare apple trees in the Kullu Valley winter' },
  { src: 'gallery/winter_2.jpg',   alt: 'Frozen mountain stream with snow-laden pine trees and Himalayan peaks in the distance' },
  { src: 'gallery/spring_1.jpg',   alt: 'Apple and plum trees in full white and pink blossom at Madhuban homestay in spring' },
  { src: 'gallery/spring_2.jpg',   alt: 'Spring wildflowers covering the orchard terraces with green Himalayan slopes behind' },
  { src: 'gallery/monsoon_1.jpg',  alt: 'Lush green Fozal Valley with mist-covered Himalayan peaks during monsoon season' },
  { src: 'gallery/monsoon_2.jpg',  alt: 'River rushing through dense green valley with dramatic monsoon clouds overhead' },
  { src: 'gallery/autumn_1.jpg',   alt: 'Apple trees heavy with ripe red fruit in golden October afternoon light at Madhuban' },
  { src: 'gallery/autumn_2.jpg',   alt: 'Spectacular autumn foliage of orange and gold contrasting with snow-capped Himalayan peaks' },
];

export default function Gallery() {
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth()); // default to current month
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const pillsRef = useRef<HTMLDivElement>(null);

  const currentMonth = MONTHS[activeMonth];
  const currentImages = currentMonth.images.map(i => GALLERY_IMAGES[i]);

  const switchMonth = (index: number) => {
    if (index === activeMonth || animating) return;
    setAnimating(true);
    setTimeout(() => {
      setActiveMonth(index);
      setAnimating(false);
    }, 220);
  };

  const openLightbox  = (index: number) => { setLightboxIndex(index); document.body.style.overflow = 'hidden'; };
  const closeLightbox = () => { setLightboxIndex(null); document.body.style.overflow = ''; };

  const prevImage = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + currentImages.length) % currentImages.length);
  }, [lightboxIndex, currentImages.length]);

  const nextImage = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % currentImages.length);
  }, [lightboxIndex, currentImages.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape')      closeLightbox();
      if (e.key === 'ArrowLeft')   prevImage();
      if (e.key === 'ArrowRight')  nextImage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, prevImage, nextImage]);

  // Keep active pill centered/visible
  useEffect(() => {
    const pills = pillsRef.current;
    if (!pills) return;
    const activePill = pills.children[activeMonth] as HTMLElement;
    if (!activePill) return;

    // Center the active pill horizontally inside the pills container
    const containerWidth = pills.clientWidth;
    const pillLeft = activePill.offsetLeft;
    const pillWidth = activePill.clientWidth;

    pills.scrollTo({
      left: pillLeft - (containerWidth / 2) + (pillWidth / 2),
      behavior: 'smooth',
    });
  }, [activeMonth]);

  return (
    <div id="gallery" className="gallery-section">

      {/* Section header */}
      <div className="intro-text gallery-header-text">
        <h2 className="font-headline headline-sm intro-title">Life at Madhuban</h2>
        <p className="body-lg gallery-tagline">
          Twelve months. One valley. A different world each season.
        </p>
      </div>

      {/* Month pill tabs */}
      <div className="gallery-pills-wrapper">
        <div className="gallery-pills" ref={pillsRef} role="tablist" aria-label="Select month">
          {MONTHS.map((month, i) => (
            <button
              key={month.key}
              id={`gallery-tab-${month.key}`}
              role="tab"
              aria-selected={i === activeMonth}
              aria-controls="gallery-grid"
              className={`gallery-pill${i === activeMonth ? ' active' : ''}`}
              onClick={() => switchMonth(i)}
            >
              {month.label}
            </button>
          ))}
        </div>
      </div>

      {/* Month context label */}
      <div className={`gallery-month-context${animating ? ' gallery-fade-out' : ''}`}>
        <span className="gallery-month-full font-headline">{currentMonth.fullLabel}</span>
        <span className="gallery-month-sep">—</span>
        <span className="gallery-month-desc">{currentMonth.desc}</span>
      </div>

      {/* Magazine Layout Photo Grid (6 Images) */}
      <div
        id="gallery-grid"
        role="tabpanel"
        aria-labelledby={`gallery-tab-${currentMonth.key}`}
        className={`gallery-magazine-grid${animating ? ' gallery-fade-out' : ''}`}
      >
        {/* 1. BIG PHOTO */}
        {currentImages[0] && (
          <div
            className="gallery-item magazine-item-big"
            onClick={() => openLightbox(0)}
            role="button"
            tabIndex={0}
            aria-label={`Open photo: ${currentImages[0].alt}`}
            onKeyDown={(e) => e.key === 'Enter' && openLightbox(0)}
          >
            <img
              src={`${import.meta.env.BASE_URL}assets/${currentImages[0].src}`}
              alt={currentImages[0].alt}
              className="gallery-img"
              loading="lazy"
            />
            <div className="gallery-item-overlay" aria-hidden="true">
              <span className="material-symbols-outlined gallery-zoom-icon">zoom_in</span>
            </div>
          </div>
        )}



        {/* 2. ASYMMETRIC PAIR 1 (small photo + large photo) */}
        <div className="magazine-row-asymmetric-1">
          {currentImages[1] && (
            <div
              className="gallery-item magazine-item-small"
              onClick={() => openLightbox(1)}
              role="button"
              tabIndex={0}
              aria-label={`Open photo: ${currentImages[1].alt}`}
              onKeyDown={(e) => e.key === 'Enter' && openLightbox(1)}
            >
              <img
                src={`${import.meta.env.BASE_URL}assets/${currentImages[1].src}`}
                alt={currentImages[1].alt}
                className="gallery-img"
                loading="lazy"
              />
              <div className="gallery-item-overlay" aria-hidden="true">
                <span className="material-symbols-outlined gallery-zoom-icon">zoom_in</span>
              </div>
            </div>
          )}

          {currentImages[2] && (
            <div
              className="gallery-item magazine-item-large"
              onClick={() => openLightbox(2)}
              role="button"
              tabIndex={0}
              aria-label={`Open photo: ${currentImages[2].alt}`}
              onKeyDown={(e) => e.key === 'Enter' && openLightbox(2)}
            >
              <img
                src={`${import.meta.env.BASE_URL}assets/${currentImages[2].src}`}
                alt={currentImages[2].alt}
                className="gallery-img"
                loading="lazy"
              />
              <div className="gallery-item-overlay" aria-hidden="true">
                <span className="material-symbols-outlined gallery-zoom-icon">zoom_in</span>
              </div>
            </div>
          )}
        </div>

        {/* 3. FULL WIDTH PHOTO */}
        {currentImages[3] && (
          <div
            className="gallery-item magazine-item-full"
            onClick={() => openLightbox(3)}
            role="button"
            tabIndex={0}
            aria-label={`Open photo: ${currentImages[3].alt}`}
            onKeyDown={(e) => e.key === 'Enter' && openLightbox(3)}
          >
            <img
              src={`${import.meta.env.BASE_URL}assets/${currentImages[3].src}`}
              alt={currentImages[3].alt}
              className="gallery-img"
              loading="lazy"
            />
            <div className="gallery-item-overlay" aria-hidden="true">
              <span className="material-symbols-outlined gallery-zoom-icon">zoom_in</span>
            </div>
          </div>
        )}

        {/* 4. ASYMMETRIC PAIR 2 (large photo + small photo) */}
        <div className="magazine-row-asymmetric-2">
          {currentImages[4] && (
            <div
              className="gallery-item magazine-item-large"
              onClick={() => openLightbox(4)}
              role="button"
              tabIndex={0}
              aria-label={`Open photo: ${currentImages[4].alt}`}
              onKeyDown={(e) => e.key === 'Enter' && openLightbox(4)}
            >
              <img
                src={`${import.meta.env.BASE_URL}assets/${currentImages[4].src}`}
                alt={currentImages[4].alt}
                className="gallery-img"
                loading="lazy"
              />
              <div className="gallery-item-overlay" aria-hidden="true">
                <span className="material-symbols-outlined gallery-zoom-icon">zoom_in</span>
              </div>
            </div>
          )}

          {currentImages[5] && (
            <div
              className="gallery-item magazine-item-small"
              onClick={() => openLightbox(5)}
              role="button"
              tabIndex={0}
              aria-label={`Open photo: ${currentImages[5].alt}`}
              onKeyDown={(e) => e.key === 'Enter' && openLightbox(5)}
            >
              <img
                src={`${import.meta.env.BASE_URL}assets/${currentImages[5].src}`}
                alt={currentImages[5].alt}
                className="gallery-img"
                loading="lazy"
              />
              <div className="gallery-item-overlay" aria-hidden="true">
                <span className="material-symbols-outlined gallery-zoom-icon">zoom_in</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="gallery-lightbox"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
        >
          {/* Close */}
          <button className="lightbox-close" onClick={closeLightbox} aria-label="Close photo viewer">
            <span className="material-symbols-outlined">close</span>
          </button>

          {/* Prev */}
          <button
            className="lightbox-nav lightbox-prev"
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            aria-label="Previous photo"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>

          {/* Image */}
          <div className="lightbox-img-wrapper" onClick={(e) => e.stopPropagation()}>
            <img
              src={`${import.meta.env.BASE_URL}assets/${currentImages[lightboxIndex].src}`}
              alt={currentImages[lightboxIndex].alt}
              className="lightbox-img"
            />
            <p className="lightbox-caption">{currentImages[lightboxIndex].alt}</p>
          </div>

          {/* Next */}
          <button
            className="lightbox-nav lightbox-next"
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            aria-label="Next photo"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>

          {/* Counter */}
          <div className="lightbox-counter" aria-live="polite">
            {lightboxIndex + 1} / {currentImages.length}
          </div>
        </div>
      )}
    </div>
  );
}
