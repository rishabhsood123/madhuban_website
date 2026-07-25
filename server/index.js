import express from 'express';
import cors from 'cors';
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure server directory exists
if (!fs.existsSync(__dirname)) {
  fs.mkdirSync(__dirname, { recursive: true });
}

const dbPath = path.join(__dirname, 'reviews.db');
const db = new DatabaseSync(dbPath);

// Initialize DB schema
db.exec(`
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT NOT NULL DEFAULT 'overall',
    name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    cleanliness INTEGER NOT NULL DEFAULT 5,
    accuracy INTEGER NOT NULL DEFAULT 5,
    check_in INTEGER NOT NULL DEFAULT 5,
    communication INTEGER NOT NULL DEFAULT 5,
    location INTEGER NOT NULL DEFAULT 5,
    value INTEGER NOT NULL DEFAULT 5,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Check if table is empty and seed initial realistic reviews
const countStmt = db.prepare('SELECT COUNT(*) as count FROM reviews');
const { count } = countStmt.get();

if (count < 10) {
  const insertStmt = db.prepare(`
    INSERT INTO reviews (room_id, name, rating, cleanliness, accuracy, check_in, communication, location, value, comment, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialReviews = [
    [
      'orchard-room',
      'Rahul Sharma',
      5, 5, 5, 5, 5, 5, 5,
      'Loved waking up right in the middle of apple orchards! Madhu ji\'s breakfasts were unforgettable — fresh, warm, and delicious. Clean, peaceful, and the private sit-out area is unmatched.',
      '2026-05-14 10:30:00'
    ],
    [
      'valley-room',
      'Ananya Roy',
      5, 5, 5, 5, 5, 5, 5,
      'The valley view from the bedroom window is out of this world. Watching the sunrise over the Himalayan peaks with chai in hand was pure bliss.',
      '2026-06-02 14:15:00'
    ],
    [
      'attic-stay',
      'Vikram & Priyal',
      5, 5, 4, 5, 5, 4, 5,
      'Such a cozy, snug attic stay under the wooden A-frame roof. Stargazing through the skylight window at night was magical. Extremely welcoming host family!',
      '2026-06-20 18:45:00'
    ],
    [
      'orchard-room',
      'Devansh Gupta',
      5, 5, 5, 5, 5, 5, 4,
      'Super clean rooms, crisp mountain air, and authentic home-cooked Himachali meals. Felt like staying with close relatives. Highly recommended for nature lovers!',
      '2026-07-08 11:20:00'
    ],
    [
      'valley-room',
      'Meera Nair',
      4, 4, 5, 5, 5, 5, 4,
      'Peaceful retreat away from tourist crowds in Manali. The soothing sound of the Fozal river nearby and the host\'s genuine hospitality made our trip truly memorable.',
      '2026-07-18 16:05:00'
    ],
    [
      'attic-stay',
      'Siddharth Verma',
      5, 5, 5, 5, 5, 5, 5,
      'Architectural masterpiece! The wooden interiors smelled wonderful, and sleeping under the slanted wooden roof felt like living in a fairyland cabin.',
      '2026-07-01 09:15:00'
    ],
    [
      'orchard-room',
      'Gehena Kapoor',
      5, 5, 5, 5, 5, 5, 5,
      'Very clean and spacious home. The interiors are beautifully done too. Kitchen was equipped with all appliances needed. The host was also very responsive and helpful.',
      '2026-06-15 17:20:00'
    ],
    [
      'valley-room',
      'Karan Mehta',
      5, 5, 5, 5, 5, 5, 5,
      'Unbelievable hospitality! Madhu aunty prepared traditional Siddu and local Himachali dishes for us. The views from the Valley Room balcony are breathtaking.',
      '2026-06-28 13:40:00'
    ],
    [
      'overall',
      'Pooja & Rohan',
      5, 5, 5, 5, 5, 5, 5,
      'We spent 4 days at Madhuban and didn\'t want to leave! The evening campfire under a starry sky surrounded by plum trees was the highlight of our Himachal trip.',
      '2026-07-10 20:10:00'
    ],
    [
      'orchard-room',
      'Amitabh Sen',
      5, 5, 5, 5, 5, 5, 4,
      'Ideal place for remote work or a digital detox. High speed Wi-Fi in the orchards, serene environment, and delicious home-cooked meals every day.',
      '2026-07-12 12:00:00'
    ],
    [
      'valley-room',
      'Sneha Kulkarni',
      5, 5, 5, 5, 5, 5, 5,
      'The morning birdsong and mountain breeze make this homestay an absolute gem. Clean, pristine, and surrounded by fruit orchards.',
      '2026-07-15 08:30:00'
    ],
    [
      'attic-stay',
      'Tushar Joshi',
      5, 5, 5, 5, 5, 5, 5,
      'Unique experience staying in an A-frame attic. The skylight view of stars at night is unmatched. Madhu Ji makes the best parathas!',
      '2026-07-20 19:10:00'
    ]
  ];

  for (const review of initialReviews) {
    insertStmt.run(...review);
  }
}

const app = express();
app.use(cors());
app.use(express.json());

// GET /api/reviews
app.get('/api/reviews', (req, res) => {
  try {
    const roomId = req.query.roomId;
    let reviews;
    if (roomId && roomId !== 'all') {
      const stmt = db.prepare("SELECT * FROM reviews WHERE room_id = ? OR room_id = 'overall' ORDER BY id DESC");
      reviews = stmt.all(roomId);
    } else {
      const stmt = db.prepare('SELECT * FROM reviews ORDER BY id DESC');
      reviews = stmt.all();
    }

    // Compute stats across all reviews
    const allStmt = db.prepare('SELECT * FROM reviews');
    const allReviews = allStmt.all();

    let avgRating = 5;
    let avgCleanliness = 5;
    let avgAccuracy = 5;
    let avgCheckIn = 5;
    let avgCommunication = 5;
    let avgLocation = 5;
    let avgValue = 5;

    if (allReviews.length > 0) {
      const sum = (arr, key) => arr.reduce((acc, r) => acc + (r[key] || 5), 0);
      avgRating = Number((sum(allReviews, 'rating') / allReviews.length).toFixed(2));
      avgCleanliness = Number((sum(allReviews, 'cleanliness') / allReviews.length).toFixed(1));
      avgAccuracy = Number((sum(allReviews, 'accuracy') / allReviews.length).toFixed(1));
      avgCheckIn = Number((sum(allReviews, 'check_in') / allReviews.length).toFixed(1));
      avgCommunication = Number((sum(allReviews, 'communication') / allReviews.length).toFixed(1));
      avgLocation = Number((sum(allReviews, 'location') / allReviews.length).toFixed(1));
      avgValue = Number((sum(allReviews, 'value') / allReviews.length).toFixed(1));
    }

    res.json({
      reviews,
      stats: {
        total: allReviews.length,
        average: avgRating,
        cleanliness: avgCleanliness,
        accuracy: avgAccuracy,
        checkIn: avgCheckIn,
        communication: avgCommunication,
        location: avgLocation,
        value: avgValue
      }
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST /api/reviews
app.post('/api/reviews', (req, res) => {
  try {
    const {
      name,
      roomId = 'overall',
      rating,
      cleanliness = 5,
      accuracy = 5,
      checkIn = 5,
      communication = 5,
      location = 5,
      value = 5,
      comment
    } = req.body;

    if (!name || !rating || !comment) {
      return res.status(400).json({ error: 'Name, rating, and comment are required fields.' });
    }

    const numRating = Math.min(5, Math.max(1, parseInt(rating, 10)));
    const stmt = db.prepare(`
      INSERT INTO reviews (room_id, name, rating, cleanliness, accuracy, check_in, communication, location, value, comment)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      roomId,
      name.trim(),
      numRating,
      parseInt(cleanliness, 10),
      parseInt(accuracy, 10),
      parseInt(checkIn, 10),
      parseInt(communication, 10),
      parseInt(location, 10),
      parseInt(value, 10),
      comment.trim()
    );

    const getStmt = db.prepare('SELECT * FROM reviews WHERE id = ?');
    const newReview = getStmt.get(result.lastInsertRowid);

    res.status(201).json(newReview);
  } catch (err) {
    console.error('Error saving review:', err);
    res.status(500).json({ error: 'Failed to save review' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Reviews API Server listening on port ${PORT}`);
});
