
import { useRef } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Player } from '@lordicon/react';
import './index.css';
import WeatherWidget from './WeatherWidget';
import RoomDetail from './RoomDetail';
import googleMapsIcon from './assets/google-maps.json';
import Gallery from './Gallery';

function HomePage() {
  const mapsPlayerRef = useRef<Player>(null);

  const handleMapsMouseEnter = () => {
    mapsPlayerRef.current?.playFromBeginning();
  };

  const handleMapsReady = () => {
    mapsPlayerRef.current?.playFromBeginning();
  };

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-top">
            <div className="logo-container">
              <img 
                alt="Madhuban Logo" 
                className="logo-img" 
                src={`${import.meta.env.BASE_URL}assets/Untitled-1-01.png`} 
              />
              <WeatherWidget />
            </div>
            <div className="flex items-center gap-md">
              <a
                href="https://maps.app.goo.gl/WDtcm3HDFhrHF83T6"
                target="_blank"
                rel="noopener noreferrer"
                className="header-map-link"
                title="Open in Google Maps"
                onMouseEnter={handleMapsMouseEnter}
              >
                <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Player
                    ref={mapsPlayerRef}
                    icon={googleMapsIcon}
                    size={32}
                    onReady={handleMapsReady}
                  />
                </div>
              </a>
              <a href="#accommodation" className="font-headline label-md text-primary plan-stay-link" style={{ textDecoration: 'underline', textUnderlineOffset: '4px' }}>
                Plan your stay
              </a>
            </div>
          </div>
          <nav className="header-nav">
            <a className="font-headline label-md text-on-surface-variant nav-link" href="#about">About</a>
            <a className="font-headline label-md text-on-surface-variant nav-link" href="#accommodation">Accommodation</a>
            <a className="font-headline label-md text-on-surface-variant nav-link" href="#facilities">Facilities</a>
            <a className="font-headline label-md text-on-surface-variant nav-link" href="#gallery">Gallery</a>
            <a className="font-headline label-md text-on-surface-variant nav-link" href="#contact">Contact Us</a>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <section className="hero-section">
          <img 
            className="hero-img" 
            alt="A serene landscape featuring a modern stone and wood cabin with a sloped roof at dawn." 
            src={`${import.meta.env.BASE_URL}assets/hero.png`} 
          />
          <div className="hero-overlay flex-col items-center justify-center">
            <h1 className="hero-title font-headline">Madhuban</h1>
            <p className="hero-subtitle label-sm">BREATHABLE HOMESTAY IN THE HEART OF NATURE.</p>
          </div>
        </section>

        <section className="container content-section">
          <div id="about" className="intro-text">
            <h1 className="font-headline headline-sm intro-title">
              About Us
            </h1>
            <p className="body-lg intro-desc">
              Welcome to Madhuban Homestay, a warm family-run retreat nestled in an orchard of apple, plum, apricot, pear, and persimmons in the serene Fozal Valley, Kullu. Our wooden A-frame cottage blends traditional Himachali charm with modern comfort. Enjoy sweeping views of snow-capped Himalayan peaks and the gentle sound of the Fozal River nearby — a perfect escape for those seeking peace, nature, and simplicity.
            </p>
          </div>

          <div className="intro-text" style={{ marginTop: '48px' }}>
            <h2 className="font-headline headline-sm intro-title">
              Meet your host
            </h2>
            <div className="body-lg intro-desc host-content">
              <img src={`${import.meta.env.BASE_URL}assets/host_family.jpg`} alt="Madhu Sood and family" className="host-img" />
              <p>
                The property is lovingly owned and managed by Madhu Sood and her family of four. Born in the beautiful Kangra district of Himachal Pradesh and raised in Bangalore, Madhu brings together the warmth of the mountains and the vibrant culture of South India.
              </p>
              <p>
                Fluent in Kannada, she spent many years in Bangalore working as a tutor for students from Grades 1 to 10, reflecting her caring and welcoming nature. She is also a passionate and talented cook, known for preparing a wide variety of delicious meals — from traditional Himachali dishes to North Indian, South Indian, and multi-cuisine specialties.
              </p>
              <p>
                Guests at Madhuban can look forward to warm hospitality, home-cooked food, and an experience that feels both peaceful and personal.
              </p>
            </div>
          </div>

          <div id="accommodation" className="intro-text" style={{ marginTop: '48px', marginBottom: '24px' }}>
            <h2 className="font-headline headline-sm intro-title">
              Accommodation
            </h2>
          </div>

          <div className="bento-grid">
            
            <Link to="/room/orchard-room" className="card room-card col-span-6 room-card-link">
              <img src={`${import.meta.env.BASE_URL}assets/orchard_room.png`} alt="Orchard Room" className="room-img" />
              <div className="room-content">
                <h3 className="font-headline headline-md text-primary mb-sm">Orchard Room</h3>
                <p className="body-md text-on-surface-variant">Wake up to the gentle rustle of apple trees. Features a private sit-out surrounded by our lush orchard.</p>
                <span className="room-card-cta label-sm">View details →</span>
              </div>
            </Link>

            <Link to="/room/valley-room" className="card room-card col-span-6 room-card-link">
              <img src={`${import.meta.env.BASE_URL}assets/valley_room.png`} alt="Valley Room" className="room-img" />
              <div className="room-content">
                <h3 className="font-headline headline-md text-primary mb-sm">Valley Room</h3>
                <p className="body-md text-on-surface-variant">Enjoy uninterrupted, sweeping views of the Fozal Valley and distant Himalayan peaks right from your bed.</p>
                <span className="room-card-cta label-sm">View details →</span>
              </div>
            </Link>

            <Link to="/room/attic-stay" className="card room-card col-span-6 room-card-link">
              <img src={`${import.meta.env.BASE_URL}assets/attic_stay.png`} alt="Attic Stay" className="room-img" />
              <div className="room-content">
                <h3 className="font-headline headline-md text-primary mb-sm">Attic Stay</h3>
                <p className="body-md text-on-surface-variant">A cozy, wood-paneled retreat under our A-frame roof. Perfect for stargazing and ultimate privacy.</p>
                <span className="room-card-cta label-sm">View details →</span>
              </div>
            </Link>

          </div>

          {/* Facilities Section */}
          <div id="facilities" className="intro-text" style={{ marginTop: '48px', marginBottom: '24px' }}>
            <h2 className="font-headline headline-sm intro-title">Facilities</h2>
          </div>

          <div className="facilities-grid">
            <div className="facility-item">
              <span className="material-symbols-outlined facility-icon">restaurant</span>
              <span className="font-headline label-md facility-label">Home-Cooked Meals</span>
            </div>
            <div className="facility-item">
              <span className="material-symbols-outlined facility-icon">landscape</span>
              <span className="font-headline label-md facility-label">Mountain Views</span>
            </div>
            <div className="facility-item">
              <span className="material-symbols-outlined facility-icon">park</span>
              <span className="font-headline label-md facility-label">Orchard Access</span>
            </div>
            <div className="facility-item">
              <span className="material-symbols-outlined facility-icon">wifi</span>
              <span className="font-headline label-md facility-label">Wi-Fi</span>
            </div>
            <div className="facility-item">
              <span className="material-symbols-outlined facility-icon">water</span>
              <span className="font-headline label-md facility-label">River Nearby</span>
            </div>
            <div className="facility-item">
              <span className="material-symbols-outlined facility-icon">local_fire_department</span>
              <span className="font-headline label-md facility-label">Evening Campfire</span>
              <span className="facility-sublabel">₹500/head/day</span>
            </div>
            <div className="facility-item">
              <span className="material-symbols-outlined facility-icon">water_drop</span>
              <span className="font-headline label-md facility-label">Hot Water</span>
            </div>
            <div className="facility-item">
              <span className="material-symbols-outlined facility-icon">local_drink</span>
              <span className="font-headline label-md facility-label">Spring Water</span>
            </div>
            <div className="facility-item">
              <span className="material-symbols-outlined facility-icon">local_parking</span>
              <span className="font-headline label-md facility-label">Free Parking</span>
            </div>
            <div className="facility-item">
              <span className="material-symbols-outlined facility-icon">pets</span>
              <span className="font-headline label-md facility-label">Pet Friendly</span>
            </div>
            <div className="facility-item">
              <span className="material-symbols-outlined facility-icon">local_taxi</span>
              <span className="font-headline label-md facility-label">Taxi Assistance</span>
            </div>
            <div className="facility-item">
              <span className="material-symbols-outlined facility-icon">directions_walk</span>
              <span className="font-headline label-md facility-label">Trek & Activity Guidance</span>
              <span className="facility-sublabel">₹500/head/day for local treks</span>
            </div>
            <div className="facility-item">
              <span className="material-symbols-outlined facility-icon">two_wheeler</span>
              <span className="font-headline label-md facility-label">Bike Rental</span>
              <span className="facility-sublabel">With prior notice</span>
            </div>
          </div>

          {/* House Rules Section */}
          <div id="house-rules" className="intro-text" style={{ marginTop: '48px', marginBottom: '24px' }}>
            <h2 className="font-headline headline-sm intro-title">House Rules</h2>
          </div>

          <ul className="house-rules-list">
            <li className="house-rule-item">
              <span className="material-symbols-outlined rule-icon">smoking_rooms</span>
              <p className="body-md text-on-surface-variant">No smoking or drinking inside the property.</p>
            </li>
            <li className="house-rule-item">
              <span className="material-symbols-outlined rule-icon">liquor</span>
              <p className="body-md text-on-surface-variant">Hard drinks and alcohol are strictly prohibited on the property.</p>
            </li>
            <li className="house-rule-item">
              <span className="material-symbols-outlined rule-icon">eco</span>
              <p className="body-md text-on-surface-variant">Please respect nature — no littering in or around the orchard.</p>
            </li>
            <li className="house-rule-item">
              <span className="material-symbols-outlined rule-icon">volume_off</span>
              <p className="body-md text-on-surface-variant">Maintain peace and quiet.</p>
            </li>
          </ul>

          <Gallery />

        </section>

      </main>

      <footer id="contact" className="footer">
        <div className="container footer-content">
          <div className="footer-details">
            <h3 className="font-headline label-md text-secondary" style={{ marginBottom: '20px' }}>Contact Us</h3>
            <div className="footer-grid">
              <div className="footer-item">
                <span className="material-symbols-outlined footer-icon">phone</span>
                <div>
                  <p className="font-headline label-md text-primary" style={{ textTransform: 'none', letterSpacing: 0 }}>Phone / WhatsApp</p>
                  <a href="https://wa.me/919816003451?text=Hey%20there%2C%20I%20am%20looking%20to%20stay%20with%20Madhuban!" target="_blank" rel="noopener noreferrer" className="body-sm text-on-surface-variant footer-link">+91 98160 03451</a>
                  <span className="body-sm text-on-surface-variant"> / </span>
                  <a href="https://wa.me/919611324105?text=Hey%20there%2C%20I%20am%20looking%20to%20stay%20with%20Madhuban!" target="_blank" rel="noopener noreferrer" className="body-sm text-on-surface-variant footer-link">+91 96113 24105</a>
                </div>
              </div>
              <div className="footer-item">
                <span className="material-symbols-outlined footer-icon">mail</span>
                <div>
                  <p className="font-headline label-md text-primary" style={{ textTransform: 'none', letterSpacing: 0 }}>Email</p>
                  <a href="mailto:stay.madhuban@gmail.com" className="body-sm text-on-surface-variant footer-link">stay.madhuban@gmail.com</a>
                </div>
              </div>
              <div className="footer-item">
                <span className="material-symbols-outlined footer-icon">location_on</span>
                <div>
                  <p className="font-headline label-md text-primary" style={{ textTransform: 'none', letterSpacing: 0 }}>Address</p>
                  <p className="body-sm text-on-surface-variant">Vill. Jhakri, PO Fojal, Teh. & Dist. Kullu,<br />Himachal Pradesh, India – 175129</p>
                </div>
              </div>
              <div className="footer-item">
                <span className="material-symbols-outlined footer-icon">photo_camera</span>
                <div>
                  <p className="font-headline label-md text-primary" style={{ textTransform: 'none', letterSpacing: 0 }}>Instagram</p>
                  <a href="https://instagram.com/madhubanorchard" target="_blank" rel="noopener noreferrer" className="body-sm text-on-surface-variant footer-link">@madhubanorchard</a>
                  <span className="body-sm text-on-surface-variant"> / </span>
                  <a href="https://instagram.com/madhusinghsood" target="_blank" rel="noopener noreferrer" className="body-sm text-on-surface-variant footer-link">@madhusinghsood</a>
                </div>
              </div>
              <div className="footer-item">
                <span className="material-symbols-outlined footer-icon">person</span>
                <div>
                  <p className="font-headline label-md text-primary" style={{ textTransform: 'none', letterSpacing: 0 }}>Host</p>
                  <p className="body-sm text-on-surface-variant">Madhu Sood</p>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="body-sm text-on-surface-variant">© 2025 Madhuban Homestay. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/room/:roomId" element={<RoomDetail />} />
    </Routes>
  );
}

export default App;
