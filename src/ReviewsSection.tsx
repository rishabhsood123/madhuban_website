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
  is_hidden?: number;
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

// Helper to deterministically pick one of 4 raw handwriting font classes for a review
function getHandwrittenFontClass(id: number | string): string {
  const str = String(id);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 4;
  }
  return `handwritten-font-${Math.abs(hash)}`;
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

  // Admin Mode State
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminKey, setAdminKey] = useState<string>(() => sessionStorage.getItem('madhuban_admin_key') || '');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState('');
  const [adminPassError, setAdminPassError] = useState('');
  const [showHiddenOnly, setShowHiddenOnly] = useState(false);

  // Check for #admin in URL hash or saved key
  useEffect(() => {
    const checkAdminState = () => {
      const isHashAdmin = window.location.hash === '#admin';
      const savedKey = sessionStorage.getItem('madhuban_admin_key');
      if (savedKey) {
        setIsAdmin(true);
        setAdminKey(savedKey);
      } else if (isHashAdmin) {
        setIsAdminModalOpen(true);
      }
    };
    checkAdminState();
    window.addEventListener('hashchange', checkAdminState);
    return () => window.removeEventListener('hashchange', checkAdminState);
  }, []);

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

  // Single Review Showcase State & Fade Animation
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Touch Swipe Gesture Handling for Mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 35; // 35px threshold

    if (distance > minSwipeDistance) {
      // Swiped Left -> Next Review
      handleNextFeatured();
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Previous Review
      handlePrevFeatured();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Reset index when filter changes or when reviews list updates
  useEffect(() => {
    setFeaturedIndex(0);
  }, [filterRoom, reviews.length]);

  const handleTransition = useCallback((nextIndex: number) => {
    if (isFading || reviews.length === 0) return;
    setIsFading(true);
    setTimeout(() => {
      setFeaturedIndex(nextIndex);
      setIsFading(false);
    }, 300);
  }, [isFading, reviews.length]);

  const handleNextFeatured = useCallback(() => {
    if (reviews.length === 0) return;
    const next = (featuredIndex + 1) % reviews.length;
    handleTransition(next);
  }, [featuredIndex, reviews.length, handleTransition]);

  const handlePrevFeatured = useCallback(() => {
    if (reviews.length === 0) return;
    const prev = (featuredIndex - 1 + reviews.length) % reviews.length;
    handleTransition(prev);
  }, [featuredIndex, reviews.length, handleTransition]);

  // Auto-play slideshow (every 7 seconds unless paused on hover or modals open)
  useEffect(() => {
    if (isPaused || reviews.length <= 1 || isAllReviewsModalOpen || isWriteModalOpen || isAdminModalOpen) return;
    const interval = setInterval(() => {
      handleNextFeatured();
    }, 7000);
    return () => clearInterval(interval);
  }, [isPaused, reviews.length, isAllReviewsModalOpen, isWriteModalOpen, isAdminModalOpen, handleNextFeatured]);

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
      const queryParams = new URLSearchParams();
      if (filterRoom && filterRoom !== 'all') {
        queryParams.set('roomId', filterRoom);
      }
      if (isAdmin) {
        if (showHiddenOnly) {
          queryParams.set('showHiddenOnly', 'true');
        } else {
          queryParams.set('includeHidden', 'true');
        }
      }
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const url = `${import.meta.env.BASE_URL}api/reviews${queryString}`;

      const headers: Record<string, string> = {};
      if (isAdmin && adminKey) {
        headers['x-admin-key'] = adminKey;
      }

      const res = await fetch(url, { headers });
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
  }, [filterRoom, isAdmin, adminKey, showHiddenOnly]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Admin Handlers
  const handleVerifyAdminPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPassError('');
    try {
      const key = adminPassInput.trim();
      const res = await fetch(`${import.meta.env.BASE_URL}api/reviews?action=verifyAdmin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': key
        },
        body: JSON.stringify({ adminKey: key })
      });
      if (res.ok) {
        sessionStorage.setItem('madhuban_admin_key', key);
        setAdminKey(key);
        setIsAdmin(true);
        setIsAdminModalOpen(false);
        setAdminPassInput('');
      } else {
        setAdminPassError('Incorrect admin passcode. Please try again.');
      }
    } catch (err) {
      setAdminPassError('Failed to verify passcode. Please check your connection.');
    }
  };

  const handleHideReview = async (id: number) => {
    if (!window.confirm('Are you sure you want to hide this review from public view? (Soft Delete)')) return;
    const activeKey = adminKey || sessionStorage.getItem('madhuban_admin_key') || '';
    if (!activeKey) {
      setAdminPassError('Please enter your admin passcode to hide reviews.');
      setIsAdminModalOpen(true);
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/reviews?id=${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-key': activeKey
        }
      });
      if (res.ok) {
        fetchReviews();
        if (selectedDetailReview?.id === id) {
          setSelectedDetailReview(null);
        }
      } else if (res.status === 401) {
        sessionStorage.removeItem('madhuban_admin_key');
        setAdminKey('');
        setAdminPassError('Admin passcode expired or invalid. Please re-enter.');
        setIsAdminModalOpen(true);
      } else {
        alert('Failed to hide review. Please try again.');
      }
    } catch (err) {
      console.error('Error hiding review:', err);
    }
  };

  const handleRestoreReview = async (id: number) => {
    const activeKey = adminKey || sessionStorage.getItem('madhuban_admin_key') || '';
    if (!activeKey) {
      setAdminPassError('Please enter your admin passcode.');
      setIsAdminModalOpen(true);
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/reviews?action=restore&id=${id}`, {
        method: 'POST',
        headers: {
          'x-admin-key': activeKey
        }
      });
      if (res.ok) {
        fetchReviews();
      } else if (res.status === 401) {
        sessionStorage.removeItem('madhuban_admin_key');
        setAdminKey('');
        setAdminPassError('Admin passcode expired or invalid. Please re-enter.');
        setIsAdminModalOpen(true);
      } else {
        alert('Failed to restore review. Please try again.');
      }
    } catch (err) {
      console.error('Error restoring review:', err);
    }
  };

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
        
        {/* Admin Mode Control Banner Bar */}
        {isAdmin && (
          <div className="admin-banner-bar">
            <div className="admin-banner-info">
              <span className="material-symbols-outlined">admin_panel_settings</span>
              <span><strong>Admin Mode Active</strong> — Only you can see this control bar</span>
            </div>
            <div className="admin-banner-actions">
              <button 
                type="button"
                className={`filter-pill ${showHiddenOnly ? 'active' : ''}`}
                style={{ backgroundColor: showHiddenOnly ? '#ffffff' : 'rgba(255, 255, 255, 0.15)', color: showHiddenOnly ? 'var(--primary)' : '#ffffff', border: 'none' }}
                onClick={() => setShowHiddenOnly(prev => !prev)}
              >
                {showHiddenOnly ? 'Show All Reviews' : 'Filter: Show Hidden Only'}
              </button>
              <button 
                type="button"
                className="admin-logout-btn"
                onClick={() => {
                  sessionStorage.removeItem('madhuban_admin_key');
                  setIsAdmin(false);
                  setAdminKey('');
                  setShowHiddenOnly(false);
                  window.location.hash = '';
                }}
              >
                Exit Admin
              </button>
            </div>
          </div>
        )}

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

        {/* Single Review Showcase Section with Alternating Fade-In / Fade-Out */}
        {loading ? (
          <div className="reviews-loading body-md text-on-surface-variant">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="reviews-empty">
            <p className="body-lg text-on-surface-variant">No reviews yet for this filter.</p>
            <button className="btn-primary" style={{ marginTop: '16px' }} onClick={openNewReviewModal}>
              Be the first to write a review
            </button>
          </div>
        ) : (
          <div 
            className="single-review-showcase-container"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Nav Prev Button */}
            {reviews.length > 1 && (
              <button 
                className="showcase-nav-btn showcase-nav-prev"
                onClick={handlePrevFeatured}
                aria-label="Previous review"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
            )}

            {/* Single Review Card (Borderless, Transparent matching website background) */}
            {(() => {
              const safeIndex = Math.min(featuredIndex, reviews.length - 1);
              const rev = reviews[safeIndex] || reviews[0];
              if (!rev) return null;

              const isLong = rev.comment.length > 250;
              const displayComment = isLong 
                ? rev.comment.slice(0, 250) + '...'
                : rev.comment;

              return (
                <div className={`single-review-card ${isFading ? 'fade-out' : 'fade-in'}`} key={rev.id}>
                  <div className="single-review-header">
                    <div className="reviewer-avatar">
                      {getInitials(rev.name)}
                    </div>
                    <div className="reviewer-meta">
                      <h3 className="font-headline label-md reviewer-name">{rev.name}</h3>
                      <span className="body-sm text-on-surface-variant reviewer-sub">Guest at Madhuban</span>
                    </div>

                    <div className="single-review-badge-group">
                      <span className={`room-badge label-sm ${rev.is_hidden ? 'hidden-badge' : ''}`}>
                        {rev.is_hidden ? 'Hidden' : (ROOM_NAMES[rev.room_id] || 'Verified Stay')}
                      </span>

                      {isAdmin ? (
                        rev.is_hidden ? (
                          <button
                            className="review-restore-btn"
                            onClick={(e) => { e.stopPropagation(); handleRestoreReview(rev.id); }}
                            title="Unhide review"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>visibility</span>
                            <span>Unhide</span>
                          </button>
                        ) : (
                          <button
                            className="review-hide-btn"
                            onClick={(e) => { e.stopPropagation(); handleHideReview(rev.id); }}
                            title="Hide review (Soft Delete)"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete</span>
                            <span>Hide</span>
                          </button>
                        )
                      ) : (
                        <button 
                          className="review-edit-btn"
                          onClick={(e) => { e.stopPropagation(); openEditReviewModal(rev); }}
                          title="Edit feedback"
                          aria-label="Edit feedback"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="single-review-subline">
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

                  <p className={`single-review-comment ${getHandwrittenFontClass(rev.id)}`}>
                    “{displayComment}”
                  </p>

                  {isLong && (
                    <button 
                      className="show-more-link"
                      onClick={() => setSelectedDetailReview(rev)}
                    >
                      Read full review &gt;
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Nav Next Button */}
            {reviews.length > 1 && (
              <button 
                className="showcase-nav-btn showcase-nav-next"
                onClick={handleNextFeatured}
                aria-label="Next review"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            )}

            {/* Dots Indicator & Counter Footer */}
            {reviews.length > 1 && (
              <div className="showcase-controls-footer">
                <div className="showcase-dots">
                  {reviews.slice(0, 10).map((_, idx) => (
                    <button
                      key={idx}
                      className={`dot-btn ${idx === (featuredIndex % Math.min(10, reviews.length)) ? 'active' : ''}`}
                      onClick={() => handleTransition(idx)}
                      aria-label={`Go to review ${idx + 1}`}
                    />
                  ))}
                </div>
                <span className="showcase-counter-text label-sm">
                  {featuredIndex + 1} of {reviews.length}
                </span>
              </div>
            )}
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
                    <p className={`body-md text-on-surface-variant ${getHandwrittenFontClass(rev.id)}`} style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{rev.comment}</p>
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

            <div className={`review-comment-full body-lg text-on-surface-variant ${getHandwrittenFontClass(selectedDetailReview.id)}`} style={{ whiteSpace: 'pre-line', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
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
      {/* SECRET ADMIN PASSCODE MODAL */}
      {isAdminModalOpen && (
        <div className="review-modal-backdrop" onClick={() => setIsAdminModalOpen(false)}>
          <div className="review-modal-card" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <button 
              className="review-modal-close" 
              onClick={() => setIsAdminModalOpen(false)}
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div style={{ textAlign: 'center', padding: '12px 0 20px' }}>
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '42px', marginBottom: '8px' }}>lock</span>
              <h2 className="font-headline headline-sm text-primary">Admin Access</h2>
              <p className="body-sm text-on-surface-variant" style={{ marginTop: '6px' }}>
                Enter your secret admin passcode to manage and hide reviews.
              </p>
            </div>

            <form onSubmit={handleVerifyAdminPasscode} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {adminPassError && (
                <div style={{ padding: '10px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '13px' }}>
                  {adminPassError}
                </div>
              )}

              <div>
                <label className="body-sm text-on-surface-variant" style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Secret Admin Passcode
                </label>
                <input
                  type="password"
                  className="filter-pill"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '15px', border: '1px solid var(--surface-container-highest)' }}
                  placeholder="Enter passcode..."
                  value={adminPassInput}
                  onChange={(e) => setAdminPassInput(e.target.value)}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="filter-pill"
                  onClick={() => setIsAdminModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="show-all-reviews-btn"
                  style={{ padding: '10px 24px' }}
                >
                  Unlock Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
