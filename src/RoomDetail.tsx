import { useParams, Link } from 'react-router-dom';
import { useRef, useState, useEffect, useCallback } from 'react';
import { getRoomById } from './roomData';

export default function RoomDetail() {
  const { roomId } = useParams<{ roomId: string }>();
  const room = getRoomById(roomId || '');
  const galleryRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const updateActiveSlide = useCallback(() => {
    const el = galleryRef.current;
    if (!el || !room) return;
    const slideWidth = el.clientWidth;
    const index = Math.round(el.scrollLeft / slideWidth);
    setActiveSlide(Math.min(index, room.images.length - 1));
  }, [room]);

  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateActiveSlide, { passive: true });
    return () => el.removeEventListener('scroll', updateActiveSlide);
  }, [updateActiveSlide]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [roomId]);

  if (!room) {
    return (
      <div className="room-not-found">
        <div className="container">
          <h1 className="font-headline headline-md text-primary">Room not found</h1>
          <p className="body-md text-on-surface-variant" style={{ marginTop: '16px' }}>
            The room you're looking for doesn't exist.
          </p>
          <Link to="/" className="back-link" style={{ marginTop: '24px', display: 'inline-block' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', verticalAlign: 'middle' }}>arrow_back</span>
            {' '}Back to Madhuban
          </Link>
        </div>
      </div>
    );
  }

  const scrollToSlide = (index: number) => {
    const el = galleryRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
  };

  const prevSlide = () => scrollToSlide(Math.max(0, activeSlide - 1));
  const nextSlide = () => scrollToSlide(Math.min(room.images.length - 1, activeSlide + 1));

  const whatsappMessage = encodeURIComponent(
    `Hi! I'm interested in booking the ${room.name} at Madhuban Homestay. Could you share availability?`
  );
  const whatsappLink = `https://wa.me/919816003451?text=${whatsappMessage}`;

  return (
    <div className="room-detail-page">
      {/* Back Navigation */}
      <div className="room-detail-header">
        <div className="container">
          <Link to="/" className="back-link">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
            <span>Back to Madhuban</span>
          </Link>
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="gallery-wrapper">
        <div className="gallery-container" ref={galleryRef}>
          {room.images.map((src, i) => (
            <div className="gallery-slide" key={i}>
              <img src={src} alt={`${room.name} - Photo ${i + 1}`} className="gallery-img" loading={i === 0 ? 'eager' : 'lazy'} />
            </div>
          ))}
        </div>

        {/* Nav Arrows (desktop) */}
        {activeSlide > 0 && (
          <button className="gallery-nav gallery-nav-prev" onClick={prevSlide} aria-label="Previous photo">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
        )}
        {activeSlide < room.images.length - 1 && (
          <button className="gallery-nav gallery-nav-next" onClick={nextSlide} aria-label="Next photo">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        )}

        {/* Dot Indicators */}
        <div className="gallery-dots">
          {room.images.map((_, i) => (
            <button
              key={i}
              className={`gallery-dot ${i === activeSlide ? 'active' : ''}`}
              onClick={() => scrollToSlide(i)}
              aria-label={`Go to photo ${i + 1}`}
            />
          ))}
        </div>

        {/* Slide Counter */}
        <div className="gallery-counter label-sm">
          {activeSlide + 1} / {room.images.length}
        </div>
      </div>

      {/* Content */}
      <div className="container room-detail-content">
        {/* Title & Location */}
        <div className="room-detail-titleblock">
          <h1 className="font-headline headline-lg text-primary room-detail-name">{room.name}</h1>
          <p className="body-md text-on-surface-variant room-detail-location">
            <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }}>location_on</span>
            Madhuban Homestay · Fozal Valley, Kullu
          </p>
        </div>

        {/* Quick Details */}
        <div className="quick-details">
          <div className="quick-detail-item">
            <span className="material-symbols-outlined">group</span>
            <span>{room.guests} guests</span>
          </div>
          <span className="quick-detail-sep">·</span>
          <div className="quick-detail-item">
            <span className="material-symbols-outlined">meeting_room</span>
            <span>{room.bedrooms} bedroom</span>
          </div>
          <span className="quick-detail-sep">·</span>
          <div className="quick-detail-item">
            <span className="material-symbols-outlined">bed</span>
            <span>{room.beds}</span>
          </div>
          <span className="quick-detail-sep">·</span>
          <div className="quick-detail-item">
            <span className="material-symbols-outlined">shower</span>
            <span>{room.bathrooms}</span>
          </div>
        </div>

        {/* Extra Beds Add-on */}
        {room.extraBeds && (
          <div className="extra-beds-callout">
            <span className="material-symbols-outlined extra-beds-icon">bed</span>
            <div className="extra-beds-text">
              <span className="font-headline label-md extra-beds-title">Extra Beds Available</span>
              <span className="body-sm text-on-surface-variant">
                Up to {room.extraBeds.count} additional single beds · {room.extraBeds.priceFormatted} / bed / person / night
              </span>
            </div>
          </div>
        )}

        {/* Description */}
        <section className="detail-section">
          <h2 className="font-headline headline-sm text-primary detail-section-title">About this room</h2>
          <p className="body-lg text-on-surface-variant">{room.longDescription}</p>
        </section>

        {/* Room Features */}
        <section className="detail-section">
          <h2 className="font-headline headline-sm text-primary detail-section-title">What this room offers</h2>
          <div className="room-features-grid">
            {room.features.map((f, i) => (
              <div className="room-feature-item" key={i}>
                <span className="material-symbols-outlined room-feature-icon">{f.icon}</span>
                <span className="body-md">{f.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Food & Dining */}
        <section className="detail-section">
          <h2 className="font-headline headline-sm text-primary detail-section-title">Food & Dining</h2>
          <p className="body-md text-on-surface-variant" style={{ marginBottom: '16px' }}>
            We serve pure, home-cooked vegetarian meals made with love by our host Madhu — from traditional Himachali dishes to North Indian, South Indian, and multi-cuisine specialties.
          </p>
          <div className="food-pricing-grid">
            <div className="food-pricing-item">
              <div className="food-pricing-header">
                <span className="material-symbols-outlined food-pricing-icon">egg_alt</span>
                <span className="font-headline label-md text-primary" style={{ textTransform: 'none' }}>Breakfast</span>
              </div>
              <span className="food-pricing-badge complimentary">Complimentary</span>
            </div>
            <div className="food-pricing-item">
              <div className="food-pricing-header">
                <span className="material-symbols-outlined food-pricing-icon">restaurant</span>
                <span className="font-headline label-md text-primary" style={{ textTransform: 'none' }}>Lunch</span>
              </div>
              <span className="food-pricing-badge">₹600 / meal</span>
            </div>
            <div className="food-pricing-item">
              <div className="food-pricing-header">
                <span className="material-symbols-outlined food-pricing-icon">dinner_dining</span>
                <span className="font-headline label-md text-primary" style={{ textTransform: 'none' }}>Dinner</span>
              </div>
              <span className="food-pricing-badge">₹600 / meal</span>
            </div>
          </div>
        </section>

        {/* Cancellation Policy */}
        <section className="detail-section">
          <h2 className="font-headline headline-sm text-primary detail-section-title">Cancellation Policy</h2>
          <div className="cancellation-card">
            <div className="cancellation-item">
              <span className="material-symbols-outlined cancellation-icon" style={{ color: 'var(--primary)' }}>check_circle</span>
              <div>
                <p className="font-headline label-md" style={{ textTransform: 'none', color: 'var(--primary)' }}>Free cancellation</p>
                <p className="body-sm text-on-surface-variant">Cancel up to 7 days before check-in for a full refund.</p>
              </div>
            </div>
            <div className="cancellation-item">
              <span className="material-symbols-outlined cancellation-icon" style={{ color: 'var(--secondary)' }}>info</span>
              <div>
                <p className="font-headline label-md" style={{ textTransform: 'none', color: 'var(--secondary)' }}>Partial refund</p>
                <p className="body-sm text-on-surface-variant">50% refund if cancelled 3–7 days before check-in.</p>
              </div>
            </div>
            <div className="cancellation-item">
              <span className="material-symbols-outlined cancellation-icon" style={{ color: '#b0483a' }}>cancel</span>
              <div>
                <p className="font-headline label-md" style={{ textTransform: 'none', color: '#b0483a' }}>No refund</p>
                <p className="body-sm text-on-surface-variant">No refund for cancellations within 3 days of check-in.</p>
              </div>
            </div>
          </div>
        </section>

        {/* House Rules */}
        <section className="detail-section" style={{ paddingBottom: '120px' }}>
          <h2 className="font-headline headline-sm text-primary detail-section-title">House Rules</h2>
          <div className="house-rules-reminder">
            <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: '20px' }}>gavel</span>
            <p className="body-md text-on-surface-variant">
              No smoking or drinking inside the property. Hard drinks and alcohol are strictly prohibited. Please respect nature and maintain peace and quiet.{' '}
              <Link to="/#house-rules" className="text-primary" style={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                View all house rules
              </Link>
            </p>
          </div>
        </section>
      </div>

      {/* Fixed Pricing Bar */}
      <div className="pricing-bar">
        <div className="pricing-bar-inner container">
          <div className="pricing-bar-price">
            <span className="font-headline headline-md text-primary">{room.priceFormatted}</span>
            <span className="body-sm text-on-surface-variant"> / night</span>
          </div>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="connect-btn">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chat</span>
            Connect with Host
          </a>
        </div>
      </div>
    </div>
  );
}
