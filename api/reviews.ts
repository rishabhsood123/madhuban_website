import { createClient } from '@libsql/client';

export interface ReviewItem {
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

// In-memory fallback initial seed store
let inMemoryReviews: ReviewItem[] = [
  {
    id: 1,
    room_id: 'orchard-room',
    name: 'Rahul Sharma',
    rating: 5,
    cleanliness: 5,
    accuracy: 5,
    check_in: 5,
    communication: 5,
    location: 5,
    value: 5,
    comment: 'Loved waking up right in the middle of apple orchards! Madhu ji\'s breakfasts were unforgettable — fresh, warm, and delicious. Clean, peaceful, and the private sit-out area is unmatched.',
    created_at: '2026-05-14 10:30:00'
  },
  {
    id: 2,
    room_id: 'valley-room',
    name: 'Ananya Roy',
    rating: 5,
    cleanliness: 5,
    accuracy: 5,
    check_in: 5,
    communication: 5,
    location: 5,
    value: 5,
    comment: 'The valley view from the bedroom window is out of this world. Watching the sunrise over the Himalayan peaks with chai in hand was pure bliss.',
    created_at: '2026-06-02 14:15:00'
  },
  {
    id: 3,
    room_id: 'attic-stay',
    name: 'Vikram & Priyal',
    rating: 5,
    cleanliness: 5,
    accuracy: 4,
    check_in: 5,
    communication: 5,
    location: 4,
    value: 5,
    comment: 'Such a cozy, snug attic stay under the wooden A-frame roof. Stargazing through the skylight window at night was magical. Extremely welcoming host family!',
    created_at: '2026-06-20 18:45:00'
  },
  {
    id: 4,
    room_id: 'orchard-room',
    name: 'Devansh Gupta',
    rating: 5,
    cleanliness: 5,
    accuracy: 5,
    check_in: 5,
    communication: 5,
    location: 5,
    value: 4,
    comment: 'Super clean rooms, crisp mountain air, and authentic home-cooked Himachali meals. Felt like staying with close relatives. Highly recommended for nature lovers!',
    created_at: '2026-07-08 11:20:00'
  },
  {
    id: 5,
    room_id: 'valley-room',
    name: 'Meera Nair',
    rating: 4,
    cleanliness: 4,
    accuracy: 5,
    check_in: 5,
    communication: 5,
    location: 5,
    value: 4,
    comment: 'Peaceful retreat away from tourist crowds in Manali. The soothing sound of the Fozal river nearby and the host\'s genuine hospitality made our trip truly memorable.',
    created_at: '2026-07-18 16:05:00'
  },
  {
    id: 6,
    room_id: 'attic-stay',
    name: 'Siddharth Verma',
    rating: 5,
    cleanliness: 5,
    accuracy: 5,
    check_in: 5,
    communication: 5,
    location: 5,
    value: 5,
    comment: 'Architectural masterpiece! The wooden interiors smelled wonderful, and sleeping under the slanted wooden roof felt like living in a fairyland cabin.',
    created_at: '2026-07-01 09:15:00'
  },
  {
    id: 7,
    room_id: 'orchard-room',
    name: 'Gehena Kapoor',
    rating: 5,
    cleanliness: 5,
    accuracy: 5,
    check_in: 5,
    communication: 5,
    location: 5,
    value: 5,
    comment: 'Very clean and spacious home. The interiors are beautifully done too. Kitchen was equipped with all appliances needed. The host was also very responsive and helpful.',
    created_at: '2026-06-15 17:20:00'
  },
  {
    id: 8,
    room_id: 'valley-room',
    name: 'Karan Mehta',
    rating: 5,
    cleanliness: 5,
    accuracy: 5,
    check_in: 5,
    communication: 5,
    location: 5,
    value: 5,
    comment: 'Unbelievable hospitality! Madhu aunty prepared traditional Siddu and local Himachali dishes for us. The views from the Valley Room balcony are breathtaking.',
    created_at: '2026-06-28 13:40:00'
  },
  {
    id: 9,
    room_id: 'overall',
    name: 'Pooja & Rohan',
    rating: 5,
    cleanliness: 5,
    accuracy: 5,
    check_in: 5,
    communication: 5,
    location: 5,
    value: 5,
    comment: 'We spent 4 days at Madhuban and didn\'t want to leave! The evening campfire under a starry sky surrounded by plum trees was the highlight of our Himachal trip.',
    created_at: '2026-07-10 20:10:00'
  },
  {
    id: 10,
    room_id: 'orchard-room',
    name: 'Amitabh Sen',
    rating: 5,
    cleanliness: 5,
    accuracy: 5,
    check_in: 5,
    communication: 5,
    location: 5,
    value: 4,
    comment: 'Ideal place for remote work or a digital detox. High speed Wi-Fi in the orchards, serene environment, and delicious home-cooked meals every day.',
    created_at: '2026-07-12 12:00:00'
  },
  {
    id: 11,
    room_id: 'valley-room',
    name: 'Sneha Kulkarni',
    rating: 5,
    cleanliness: 5,
    accuracy: 5,
    check_in: 5,
    communication: 5,
    location: 5,
    value: 5,
    comment: 'The morning birdsong and mountain breeze make this homestay an absolute gem. Clean, pristine, and surrounded by fruit orchards.',
    created_at: '2026-07-15 08:30:00'
  },
  {
    id: 12,
    room_id: 'attic-stay',
    name: 'Tushar Joshi',
    rating: 5,
    cleanliness: 5,
    accuracy: 5,
    check_in: 5,
    communication: 5,
    location: 5,
    value: 5,
    comment: 'Unique experience staying in an A-frame attic. The skylight view of stars at night is unmatched. Madhu Ji makes the best parathas!',
    created_at: '2026-07-20 19:10:00'
  }
];

let nextId = 13;

function getTursoClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) return null;
  return createClient({
    url,
    authToken: authToken || '',
  });
}

async function initTursoDb(turso: ReturnType<typeof createClient>) {
  await turso.execute(`
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_hidden INTEGER DEFAULT 0
    );
  `);

  try {
    await turso.execute('ALTER TABLE reviews ADD COLUMN is_hidden INTEGER DEFAULT 0');
  } catch (e) {
    // Column already exists, ignore error
  }
}

function computeStats(reviews: ReviewItem[]) {
  if (reviews.length === 0) {
    return {
      total: 0,
      average: 5.0,
      cleanliness: 5.0,
      accuracy: 5.0,
      checkIn: 5.0,
      communication: 5.0,
      location: 5.0,
      value: 5.0
    };
  }
  const sum = (key: keyof ReviewItem) => reviews.reduce((acc, item) => acc + (Number(item[key]) || 5), 0);
  return {
    total: reviews.length,
    average: Number((sum('rating') / reviews.length).toFixed(2)),
    cleanliness: Number((sum('cleanliness') / reviews.length).toFixed(1)),
    accuracy: Number((sum('accuracy') / reviews.length).toFixed(1)),
    checkIn: Number((sum('check_in') / reviews.length).toFixed(1)),
    communication: Number((sum('communication') / reviews.length).toFixed(1)),
    location: Number((sum('location') / reviews.length).toFixed(1)),
    value: Number((sum('value') / reviews.length).toFixed(1))
  };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const turso = getTursoClient();
  const { method } = req;
  const urlParts = (req.url || '').split('?');
  const queryParams = new URLSearchParams(urlParts[1] || '');
  const roomIdParam = req.query?.roomId || queryParams.get('roomId');

  try {
    // Admin authentication helper
    const ADMIN_KEY = process.env.ADMIN_KEY || 'madhuban123';
    const bodyObj = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const reqAdminKey = req.headers['x-admin-key'] || (req.query as any)?.adminKey || bodyObj?.adminKey;
    const isAdmin = Boolean(reqAdminKey && String(reqAdminKey).trim().toLowerCase() === String(ADMIN_KEY).trim().toLowerCase());

    // Only respond with verify status if explicitly requested via verify endpoint or verifyAdmin action parameter
    if ((req.url?.includes('verify') || (req.query as any)?.action === 'verifyAdmin' || (req.query as any)?.verifyAdmin) && method === 'POST') {
      if (isAdmin) {
        return res.status(200).json({ success: true, message: 'Admin passcode verified' });
      }
      return res.status(401).json({ error: 'Invalid admin passcode' });
    }

    const includeHidden = (req.query as any)?.includeHidden === 'true' && isAdmin;
    const showHiddenOnlyParam = (req.query as any)?.showHiddenOnly === 'true' && isAdmin;

    // Check Turso database first if configured
    if (turso) {
      if (method === 'GET') {
        let query = "SELECT * FROM reviews";
        const args: any[] = [];
        const conditions: string[] = [];

        if (showHiddenOnlyParam) {
          conditions.push("is_hidden = 1");
        } else if (!includeHidden) {
          conditions.push("(is_hidden = 0 OR is_hidden IS NULL)");
        }

        if (roomIdParam && roomIdParam !== 'all') {
          conditions.push("(room_id = ? OR room_id = 'overall')");
          args.push(roomIdParam);
        }

        if (conditions.length > 0) {
          query += " WHERE " + conditions.join(" AND ");
        }
        query += " ORDER BY id DESC";

        const reviewsRes = await turso.execute({ sql: query, args });
        const allRes = await turso.execute({ sql: "SELECT * FROM reviews WHERE (is_hidden = 0 OR is_hidden IS NULL)", args: [] });

        const reviews = reviewsRes.rows as unknown as ReviewItem[];
        const allReviews = allRes.rows as unknown as ReviewItem[];
        const stats = computeStats(allReviews);

        return res.status(200).json({ reviews, stats });
      }

      if (method === 'POST' && req.url?.includes('/restore')) {
        if (!isAdmin) return res.status(401).json({ error: 'Unauthorized: Invalid Admin Passcode' });
        const pathParts = (req.url || '').split('/');
        const targetId = parseInt(pathParts[pathParts.indexOf('reviews') + 1] || (req.query as any)?.id, 10);
        await turso.execute({
          sql: "UPDATE reviews SET is_hidden = 0 WHERE id = ?",
          args: [targetId]
        });
        return res.status(200).json({ success: true, id: targetId, is_hidden: 0 });
      }

      if (method === 'POST') {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
        const {
          name,
          roomId = 'overall',
          rating = 5,
          cleanliness = 5,
          accuracy = 5,
          checkIn = 5,
          communication = 5,
          location = 5,
          value = 5,
          comment
        } = body;

        if (!name || !comment) {
          return res.status(400).json({ error: 'Name and comment are required.' });
        }

        const insertRes = await turso.execute({
          sql: `INSERT INTO reviews (room_id, name, rating, cleanliness, accuracy, check_in, communication, location, value, comment, is_hidden)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
                RETURNING *`,
          args: [
            roomId,
            name.trim(),
            Math.min(5, Math.max(1, parseInt(rating, 10))),
            parseInt(cleanliness, 10) || 5,
            parseInt(accuracy, 10) || 5,
            parseInt(checkIn, 10) || 5,
            parseInt(communication, 10) || 5,
            parseInt(location, 10) || 5,
            parseInt(value, 10) || 5,
            comment.trim()
          ]
        });

        return res.status(201).json(insertRes.rows[0]);
      }

      if (method === 'PUT') {
        if (!isAdmin) return res.status(401).json({ error: 'Unauthorized: Invalid Admin Passcode' });
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
        const pathIdStr = (req.url || '').split('/').pop()?.split('?')[0];
        const targetId = parseInt((req.query as any)?.id || pathIdStr || body.id, 10);

        await turso.execute({
          sql: `UPDATE reviews 
                SET room_id = ?, name = ?, rating = ?, cleanliness = ?, accuracy = ?, check_in = ?, communication = ?, location = ?, value = ?, comment = ?
                WHERE id = ?`,
          args: [
            body.roomId || 'overall',
            (body.name || '').trim(),
            Math.min(5, Math.max(1, parseInt(body.rating, 10))) || 5,
            parseInt(body.cleanliness, 10) || 5,
            parseInt(body.accuracy, 10) || 5,
            parseInt(body.checkIn, 10) || 5,
            parseInt(body.communication, 10) || 5,
            parseInt(body.location, 10) || 5,
            parseInt(body.value, 10) || 5,
            (body.comment || '').trim(),
            targetId
          ]
        });

        const fetchRes = await turso.execute({
          sql: "SELECT * FROM reviews WHERE id = ?",
          args: [targetId]
        });

        return res.status(200).json(fetchRes.rows[0]);
      }

      if (method === 'DELETE') {
        if (!isAdmin) return res.status(401).json({ error: 'Unauthorized: Invalid Admin Passcode' });
        const pathIdStr = (req.url || '').split('/').pop()?.split('?')[0];
        const targetId = parseInt((req.query as any)?.id || pathIdStr, 10);

        await turso.execute({
          sql: "UPDATE reviews SET is_hidden = 1 WHERE id = ?",
          args: [targetId]
        });

        return res.status(200).json({ success: true, id: targetId, is_hidden: 1 });
      }
    }

    // In-Memory Fallback if no TURSO_DATABASE_URL is set
    if (method === 'GET') {
      let filtered = inMemoryReviews;
      if (showHiddenOnlyParam) {
        filtered = filtered.filter((r) => r.is_hidden === 1);
      } else if (!includeHidden) {
        filtered = filtered.filter((r) => !r.is_hidden);
      }
      if (roomIdParam && roomIdParam !== 'all') {
        filtered = filtered.filter(
          (r) => r.room_id === roomIdParam || r.room_id === 'overall'
        );
      }
      const sorted = [...filtered].sort((a, b) => b.id - a.id);
      const activeReviews = inMemoryReviews.filter((r) => !r.is_hidden);
      const stats = computeStats(activeReviews);
      return res.status(200).json({ reviews: sorted, stats });
    }

    if (method === 'POST' && req.url?.includes('/restore')) {
      if (!isAdmin) return res.status(401).json({ error: 'Unauthorized: Invalid Admin Passcode' });
      const pathParts = (req.url || '').split('/');
      const targetId = parseInt(pathParts[pathParts.indexOf('reviews') + 1] || (req.query as any)?.id, 10);
      const index = inMemoryReviews.findIndex((r) => r.id === targetId);
      if (index !== -1) {
        inMemoryReviews[index].is_hidden = 0;
      }
      return res.status(200).json({ success: true, id: targetId, is_hidden: 0 });
    }

    if (method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const {
        name,
        roomId = 'overall',
        rating = 5,
        cleanliness = 5,
        accuracy = 5,
        checkIn = 5,
        communication = 5,
        location = 5,
        value = 5,
        comment
      } = body;

      if (!name || !comment) {
        return res.status(400).json({ error: 'Name and comment are required.' });
      }

      const newReview: ReviewItem & { is_hidden?: number } = {
        id: nextId++,
        room_id: roomId,
        name: name.trim(),
        rating: Math.min(5, Math.max(1, parseInt(rating, 10))),
        cleanliness: parseInt(cleanliness, 10) || 5,
        accuracy: parseInt(accuracy, 10) || 5,
        check_in: parseInt(checkIn, 10) || 5,
        communication: parseInt(communication, 10) || 5,
        location: parseInt(location, 10) || 5,
        value: parseInt(value, 10) || 5,
        comment: comment.trim(),
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        is_hidden: 0
      };

      inMemoryReviews.unshift(newReview);
      return res.status(201).json(newReview);
    }

    if (method === 'PUT') {
      if (!isAdmin) return res.status(401).json({ error: 'Unauthorized: Invalid Admin Passcode' });
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const pathIdStr = (req.url || '').split('/').pop()?.split('?')[0];
      const targetId = parseInt((req.query as any)?.id || pathIdStr || body.id, 10);

      const index = inMemoryReviews.findIndex((r) => r.id === targetId);
      if (index === -1) {
        return res.status(404).json({ error: 'Review not found.' });
      }

      const updated: ReviewItem & { is_hidden?: number } = {
        ...inMemoryReviews[index],
        room_id: body.roomId || inMemoryReviews[index].room_id,
        name: body.name ? body.name.trim() : inMemoryReviews[index].name,
        rating: body.rating ? Math.min(5, Math.max(1, parseInt(body.rating, 10))) : inMemoryReviews[index].rating,
        cleanliness: body.cleanliness ? parseInt(body.cleanliness, 10) : inMemoryReviews[index].cleanliness,
        accuracy: body.accuracy ? parseInt(body.accuracy, 10) : inMemoryReviews[index].accuracy,
        check_in: body.checkIn ? parseInt(body.checkIn, 10) : inMemoryReviews[index].check_in,
        communication: body.communication ? parseInt(body.communication, 10) : inMemoryReviews[index].communication,
        location: body.location ? parseInt(body.location, 10) : inMemoryReviews[index].location,
        value: body.value ? parseInt(body.value, 10) : inMemoryReviews[index].value,
        comment: body.comment ? body.comment.trim() : inMemoryReviews[index].comment
      };

      inMemoryReviews[index] = updated;
      return res.status(200).json(updated);
    }

    if (method === 'DELETE') {
      if (!isAdmin) return res.status(401).json({ error: 'Unauthorized: Invalid Admin Passcode' });
      const pathIdStr = (req.url || '').split('/').pop()?.split('?')[0];
      const targetId = parseInt((req.query as any)?.id || pathIdStr, 10);
      const index = inMemoryReviews.findIndex((r) => r.id === targetId);
      if (index !== -1) {
        inMemoryReviews[index].is_hidden = 1;
      }
      return res.status(200).json({ success: true, id: targetId, is_hidden: 1 });
    }

    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  } catch (err: any) {
    console.error('API Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}

