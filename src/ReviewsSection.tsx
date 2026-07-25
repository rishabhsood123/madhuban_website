import { useState, useEffect, useCallback, useRef } from 'react';

export interface Review {
  id: number;
  room_id: string;
  name: string;
  rating: number;
  cleanliness: number;
  accuracy: number;
  check_in: number;
  communication: number;
  location: number;
  value: number;
  comment: string;
  created_at: string;
}

export interface ReviewStats {
  total: number;
  average: number;
  cleanliness: number;
  accuracy: number;
  checkIn: number;
  communication: number;
  location: number;
  value: number;
}

interface ReviewsSectionProps {
  roomId?: string;
}

const ROOM_NAMES: Record<string, string> = {
  overall: 'Overall Homestay',
  'orchard-room': 'Orchard Room',
  'valley-room': 'Valley Room',
  'attic-stay': 'Attic Stay',
};

// Helper for initials
function getInitials(name: string): string {
  if (!name) return 'G';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// Format date (e.g. "June 2026")
function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch {
    return 'Recently';
  }
}

export default function ReviewsSection({ roomId }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterRoom, setFilterRoom] = useState<string>(roomId || 'all');
  
  // Modals & Editing
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isAllReviewsModalOpen, setIsAllReviewsModalOpen] = useState(false);
  const [selectedDetailReview, setSelectedDetailReview] = useState<Review | null>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [name, setName] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(roomId || 'overall');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [cleanliness, setCleanliness] = useState(5);
  const [accuracy, setAccuracy] = useState(5);
  const [checkIn, setCheckIn] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [locationRating, setLocationRating] = useState(5);
  const [valueRating, setValueRating] = useState(5);
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState('');

  // Carousel ref
  const carouselRef = useRef<HTMLDivElement>(null);

  const openNewReviewModal = () => {
    setEditingReview(null);
    setName('');
    setSelectedRoom(roomId || 'overall');
    setRating(5);
    setCleanliness(5);
    setAccuracy(5);
    setCheckIn(5);
    setCommunication(5);
    setLocationRating(5);
    setValueRating(5);
    setComment('');
    setFormError('');
    setIsWriteModalOpen(true);
  };

  const openEditReviewModal = (rev: Review) => {
    setEditingReview(rev);
    setName(rev.name);
    setSelectedRoom(rev.room_id || 'overall');
    setRating(rev.rating || 5);
    setCleanliness(rev.cleanliness || 5);
    setAccuracy(rev.accuracy || 5);
    setCheckIn(rev.check_in || 5);
    setCommunication(rev.communication || 5);
    setLocationRating(rev.location || 5);
    setValueRating(rev.value || 5);
    setComment(rev.comment || '');
    setFormError('');
    setIsWriteModalOpen(true);
  };

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterRoom && filterRoom !== 'all' 
        ? `${import.meta.env.BASE_URL}api/reviews?roomId=${filterRoom}`
        : `${import.meta.env.BASE_URL}api/reviews`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setStats(data.stats || null);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [filterRoom]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Scroll controls for horizontal carousel
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = direction === 'left' ? -380 : 380;
    carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim()) {
      setFormError('Please enter your name.');
      return;
    }
    if (!comment.trim()) {
      setFormError('Please write your review comment.');
      return;
    }

    setIsSubmitting(true);
    try {
      const isEditing = Boolean(editingReview);
      const url = isEditing
        ? `${import.meta.env.BASE_URL}api/reviews/${editingReview!.id}`
        : `${import.meta.env.BASE_URL}api/reviews`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          roomId: selectedRoom,
          rating,
          cleanliness,
          accuracy,
          checkIn,
          communication,
          location: locationRating,
          value: valueRating,
          comment: comment.trim(),
        }),
      });

      if (res.ok) {
        const updatedData = await res.json();
        setSubmitSuccess(true);
        setTimeout(() => {
          setIsWriteModalOpen(false);
          setSubmitSuccess(false);
          setEditingReview(null);
          setName('');
          setComment('');
          setRating(5);
          fetchReviews();
          if (selectedDetailReview && selectedDetailReview.id === updatedData.id) {
            setSelectedDetailReview(updatedData);
          }
        }, 1200);
      } else {
        const errData = await res.json();
        setFormError(errData.error || 'Failed to save review.');
      }
    } catch (err) {
      console.error('Error saving review:', err);
      setFormError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const avgScore = stats ? stats.average.toFixed(1) : '5.0';
  const totalCount = stats ? stats.total : reviews.length;

  // Latest 10 reviews for horizontal swipe
  const carouselReviews = reviews.slice(0, 10);

  // Filtered reviews for "Show all reviews" modal
  const filteredAllReviews = reviews.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q);
  });

  return (
    <section id="reviews" className="reviews-section">
      <div className="container">
        
        {/* Centered Section Header matching rest of website */}
        <div className="intro-text reviews-header-text" style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 className="font-headline headline-sm intro-title" style={{ marginBottom: '8px' }}>
            Guest Reviews
          </h2>
          <div className="reviews-hero-subtitle-centered">
            <span className="reviews-score-pill">
              <svg className="star-icon-svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
              <span className="score-num">{avgScore}</span>
            </span>
            <span className="body-md text-on-surface-variant">
              · {totalCount} {totalCount === 1 ? 'review' : 'reviews'} from guests who stayed at Madhuban
            </span>
          </div>
          
          <div style={{ marginTop: '16px' }}>
            <button 
              className="btn-primary write-review-btn-compact"
              onClick={openNewReviewModal}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', marginRight: '6px' }}>rate_review</span>
              Write a Review
            </button>
          </div>
        </div>

        {/* Airbnb Category Rating Bars */}
        {stats && (
          <div className="reviews-categories-grid">
            <div className="category-rating-item">
              <span className="category-label body-sm">Cleanliness</span>
              <div className="rating-bar-container">
                <div className="rating-bar-fill" style={{ width: `${(stats.cleanliness / 5) * 100}%` }}></div>
              </div>
              <span className="category-value label-sm">{stats.cleanliness.toFixed(1)}</span>
            </div>

            <div className="category-rating-item">
              <span className="category-label body-sm">Accuracy</span>
              <div className="rating-bar-container">
                <div className="rating-bar-fill" style={{ width: `${(stats.accuracy / 5) * 100}%` }}></div>
              </div>
              <span className="category-value label-sm">{stats.accuracy.toFixed(1)}</span>
            </div>

            <div className="category-rating-item">
              <span className="category-label body-sm">Check-in</span>
              <div className="rating-bar-container">
                <div className="rating-bar-fill" style={{ width: `${(stats.checkIn / 5) * 100}%` }}></div>
              </div>
              <span className="category-value label-sm">{stats.checkIn.toFixed(1)}</span>
            </div>

            <div className="category-rating-item">
              <span className="category-label body-sm">Communication</span>
              <div className="rating-bar-container">
                <div className="rating-bar-fill" style={{ width: `${(stats.communication / 5) * 100}%` }}></div>
              </div>
              <span className="category-value label-sm">{stats.communication.toFixed(1)}</span>
            </div>

            <div className="category-rating-item">
              <span className="category-label body-sm">Location</span>
              <div className="rating-bar-container">
                <div className="rating-bar-fill" style={{ width: `${(stats.location / 5) * 100}%` }}></div>
              </div>
              <span className="category-value label-sm">{stats.location.toFixed(1)}</span>
            </div>

            <div className="category-rating-item">
              <span className="category-label body-sm">Value</span>
              <div className="rating-bar-container">
                <div className="rating-bar-fill" style={{ width: `${(stats.value / 5) * 100}%` }}></div>
              </div>
              <span className="category-value label-sm">{stats.value.toFixed(1)}</span>
            </div>
          </div>
        )}

        {/* Filter Pills */}
        {!roomId && (
          <div className="reviews-filter-bar">
            <span className="body-sm text-on-surface-variant filter-title">Filter by stay:</span>
            <button 
              className={`filter-pill ${filterRoom === 'all' ? 'active' : ''}`}
              onClick={() => setFilterRoom('all')}
            >
              All Stays
            </button>
            <button 
              className={`filter-pill ${filterRoom === 'orchard-room' ? 'active' : ''}`}
              onClick={() => setFilterRoom('orchard-room')}
            >
              Orchard Room
            </button>
            <button 
              className={`filter-pill ${filterRoom === 'valley-room' ? 'active' : ''}`}
              onClick={() => setFilterRoom('valley-room')}
            >
              Valley Room
            </button>
            <button 
              className={`filter-pill ${filterRoom === 'attic-stay' ? 'active' : ''}`}
              onClick={() => setFilterRoom('attic-stay')}
            >
              Attic Stay
            </button>
          </div>
        )}

        {/* Horizontal Carousel Section (Latest 10 Reviews) */}
        {loading ? (
          <div className="reviews-loading body-md text-on-surface-variant">Loading reviews...</div>
        ) : carouselReviews.length === 0 ? (
          <div className="reviews-empty">
            <p className="body-lg text-on-surface-variant">No reviews yet for this filter.</p>
            <button className="btn-primary" style={{ marginTop: '16px' }} onClick={openNewReviewModal}>
              Be the first to write a review
            </button>
          </div>
        ) : (
          <div className="reviews-carousel-wrapper">
            
            {/* Nav Arrows */}
            <button 
              className="carousel-nav-btn carousel-nav-left"
              onClick={() => scrollCarousel('left')}
              aria-label="Previous reviews"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            <div className="reviews-carousel-container" ref={carouselRef}>
              {carouselReviews.map((rev) => {
                const isLong = rev.comment.length > 130;
                const displayComment = isLong 
                  ? rev.comment.slice(0, 130) + '...'
                  : rev.comment;

                return (
                  <div className="review-card-carousel" key={rev.id}>
                    <div className="review-card-header">
                      <div className="reviewer-avatar">
                        {getInitials(rev.name)}
                      </div>
                      <div className="reviewer-meta">
                        <h3 className="font-headline label-md reviewer-name">{rev.name}</h3>
                        <span className="body-sm text-on-surface-variant reviewer-sub">Guest at Madhuban</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="room-badge label-sm">
                          {ROOM_NAMES[rev.room_id] || 'Verified Stay'}
                        </span>
                        <button 
                          className="review-edit-btn"
                          onClick={(e) => { e.stopPropagation(); openEditReviewModal(rev); }}
                          title="Edit feedback"
                          aria-label="Edit feedback"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit</span>
                        </button>
                      </div>
                    </div>

                    <div className="review-card-subline">
                      <div className="review-stars-mini">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span 
                            key={star} 
                            className={`material-symbols-outlined star-icon ${star <= rev.rating ? 'filled' : 'empty'}`}
                          >
                            star
                          </span>
                        ))}
                      </div>
                      <span className="bullet-sep">·</span>
                      <span className="review-date-text">{formatDate(rev.created_at)}</span>
                    </div>

                    <p className="body-md text-on-surface-variant review-comment">
                      {displayComment}
                    </p>

                    {isLong && (
                      <button 
                        className="show-more-link"
                        onClick={() => setSelectedDetailReview(rev)}
                      >
                        Show more &gt;
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <button 
              className="carousel-nav-btn carousel-nav-right"
              onClick={() => scrollCarousel('right')}
              aria-label="Next reviews"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}

        {/* Airbnb Style "Show all (N) reviews" Button */}
        {totalCount > 0 && (
          <div className="show-all-reviews-wrapper">
            <button 
              className="show-all-reviews-btn"
              onClick={() => setIsAllReviewsModalOpen(true)}
            >
              Show all {totalCount} reviews
            </button>
          </div>
        )}

      </div>

      {/* FULL REVIEWS MODAL ("Show all N reviews") */}
      {isAllReviewsModalOpen && (
        <div className="review-modal-backdrop" onClick={() => setIsAllReviewsModalOpen(false)}>
          <div className="all-reviews-modal-card" onClick={(e) => e.stopPropagation()}>
            <button 
              className="review-modal-close" 
              onClick={() => setIsAllReviewsModalOpen(false)}
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* Modal Header */}
            <div className="all-reviews-modal-header">
              <div className="reviews-score-badge">
                <svg className="star-icon-svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                <span className="score-value">{avgScore}</span>
              </div>
              <div>
                <h2 className="font-headline headline-sm text-primary">All {totalCount} reviews</h2>
                <p className="body-sm text-on-surface-variant">Real experiences from guests at Madhuban</p>
              </div>
            </div>

            {/* Search Input */}
            <div className="all-reviews-search-bar">
              <span className="material-symbols-outlined search-icon">search</span>
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Scrollable list of reviews */}
            <div className="all-reviews-list">
              {filteredAllReviews.length === 0 ? (
                <p className="body-md text-on-surface-variant" style={{ padding: '24px 0', textAlign: 'center' }}>
                  No reviews match "{searchQuery}"
                </p>
              ) : (
                filteredAllReviews.map((rev) => (
                  <div className="all-review-item" key={rev.id}>
                    <div className="review-card-header">
                      <div className="reviewer-avatar">
                        {getInitials(rev.name)}
                      </div>
                      <div className="reviewer-meta">
                        <h3 className="font-headline label-md reviewer-name">{rev.name}</h3>
                        <span className="body-sm text-on-surface-variant">{formatDate(rev.created_at)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="room-badge label-sm">
                          {ROOM_NAMES[rev.room_id] || 'Verified Stay'}
                        </span>
                        <button 
                          className="review-edit-btn"
                          onClick={(e) => { e.stopPropagation(); openEditReviewModal(rev); }}
                          title="Edit feedback"
                          aria-label="Edit feedback"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit</span>
                        </button>
                      </div>
                    </div>
                    <div className="review-stars-mini" style={{ margin: '8px 0' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span 
                          key={star} 
                          className={`material-symbols-outlined star-icon ${star <= rev.rating ? 'filled' : 'empty'}`}
                        >
                          star
                        </span>
                      ))}
                    </div>
                    <p className="body-md text-on-surface-variant" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* "WRITE / EDIT A REVIEW" MODAL */}
      {isWriteModalOpen && (
        <div className="review-modal-backdrop" onClick={() => setIsWriteModalOpen(false)}>
          <div className="review-modal-card" onClick={(e) => e.stopPropagation()}>
            <button 
              className="review-modal-close" 
              onClick={() => setIsWriteModalOpen(false)}
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {submitSuccess ? (
              <div className="review-success-state">
                <span className="material-symbols-outlined success-icon">check_circle</span>
                <h3 className="font-headline headline-md text-primary">
                  {editingReview ? 'Review updated successfully!' : 'Thank you for your feedback!'}
                </h3>
                <p className="body-md text-on-surface-variant">
                  {editingReview ? 'Your changes have been saved.' : 'Your review has been successfully published.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="review-form">
                <h2 className="font-headline headline-sm text-primary" style={{ marginBottom: '8px' }}>
                  {editingReview ? 'Edit your review' : 'Share your experience'}
                </h2>
                <p className="body-sm text-on-surface-variant" style={{ marginBottom: '24px' }}>
                  {editingReview ? 'Update your ratings and feedback for Madhuban Homestay.' : 'Help future guests learn about staying at Madhuban Homestay.'}
                </p>

                {formError && (
                  <div className="review-form-error body-sm">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', marginRight: '6px' }}>error</span>
                    {formError}
                  </div>
                )}

                {/* Name */}
                <div className="form-group">
                  <label className="form-label label-md text-primary">Your Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Room */}
                <div className="form-group">
                  <label className="form-label label-md text-primary">Room / Stay</label>
                  <select
                    className="form-select"
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                  >
                    <option value="overall">Overall Homestay</option>
                    <option value="orchard-room">Orchard Room</option>
                    <option value="valley-room">Valley Room</option>
                    <option value="attic-stay">Attic Stay</option>
                  </select>
                </div>

                {/* Star Picker */}
                <div className="form-group">
                  <label className="form-label label-md text-primary">Overall Rating *</label>
                  <div className="interactive-star-picker">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        className={`star-pick-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        aria-label={`Rate ${star} star`}
                      >
                        <span className="material-symbols-outlined">star</span>
                      </button>
                    ))}
                    <span className="star-pick-label label-sm text-on-surface-variant">
                      {hoverRating || rating} of 5 stars
                    </span>
                  </div>
                </div>

                {/* Subcategory Pickers */}
                <div className="subcategory-pickers-grid">
                  <div className="sub-picker-item">
                    <span className="body-sm">Cleanliness</span>
                    <select value={cleanliness} onChange={(e) => setCleanliness(Number(e.target.value))} className="form-select-sm">
                      {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}
                    </select>
                  </div>
                  <div className="sub-picker-item">
                    <span className="body-sm">Accuracy</span>
                    <select value={accuracy} onChange={(e) => setAccuracy(Number(e.target.value))} className="form-select-sm">
                      {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}
                    </select>
                  </div>
                  <div className="sub-picker-item">
                    <span className="body-sm">Check-in</span>
                    <select value={checkIn} onChange={(e) => setCheckIn(Number(e.target.value))} className="form-select-sm">
                      {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}
                    </select>
                  </div>
                  <div className="sub-picker-item">
                    <span className="body-sm">Communication</span>
                    <select value={communication} onChange={(e) => setCommunication(Number(e.target.value))} className="form-select-sm">
                      {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}
                    </select>
                  </div>
                  <div className="sub-picker-item">
                    <span className="body-sm">Location</span>
                    <select value={locationRating} onChange={(e) => setLocationRating(Number(e.target.value))} className="form-select-sm">
                      {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}
                    </select>
                  </div>
                  <div className="sub-picker-item">
                    <span className="body-sm">Value</span>
                    <select value={valueRating} onChange={(e) => setValueRating(Number(e.target.value))} className="form-select-sm">
                      {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}
                    </select>
                  </div>
                </div>

                {/* Review text */}
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label className="form-label label-md text-primary">Your Review / Feedback *</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Describe your stay, the view, host hospitality, room comfort, or food..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                </div>

                <div className="modal-actions flex justify-between items-center" style={{ marginTop: '24px' }}>
                  <button
                    type="button"
                    className="back-link"
                    onClick={() => setIsWriteModalOpen(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SINGLE REVIEW DETAIL MODAL (Tapping "Show more") */}
      {selectedDetailReview && (
        <div className="review-modal-backdrop" onClick={() => setSelectedDetailReview(null)}>
          <div className="all-reviews-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <button 
              className="review-modal-close" 
              onClick={() => setSelectedDetailReview(null)}
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="review-card-header" style={{ marginBottom: '16px' }}>
              <div className="reviewer-avatar">
                {getInitials(selectedDetailReview.name)}
              </div>
              <div className="reviewer-meta">
                <h3 className="font-headline headline-sm reviewer-name">{selectedDetailReview.name}</h3>
                <span className="body-sm text-on-surface-variant">{formatDate(selectedDetailReview.created_at)}</span>
              </div>
              <span className="room-badge label-sm">
                {ROOM_NAMES[selectedDetailReview.room_id] || 'Verified Stay'}
              </span>
            </div>

            <div className="review-stars-mini" style={{ marginBottom: '16px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star} 
                  className={`material-symbols-outlined star-icon ${star <= selectedDetailReview.rating ? 'filled' : 'empty'}`}
                  style={{ fontSize: '22px' }}
                >
                  star
                </span>
              ))}
            </div>

            <div className="review-comment-full body-lg text-on-surface-variant" style={{ whiteSpace: 'pre-line', wordBreak: 'break-word', overflowWrap: 'anywhere', lineHeight: 1.6 }}>
              {selectedDetailReview.comment}
            </div>

            <div className="modal-actions flex justify-between items-center" style={{ marginTop: '24px' }}>
              <button 
                type="button"
                className="filter-pill"
                onClick={() => {
                  const revToEdit = selectedDetailReview;
                  setSelectedDetailReview(null);
                  openEditReviewModal(revToEdit);
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                Edit Feedback
              </button>
              <button className="btn-primary" onClick={() => setSelectedDetailReview(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
