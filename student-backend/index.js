const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'maria', // change if needed
  database: 'student_system',
});

db.connect(err => {
  if (err) {
    console.error('Database connection error:', err.message);
    process.exit(1); // Exit the process if the database connection fails
  } else {
    console.log('Connected to MariaDB');
  }
});

// 1. Remove MongoDB code (already using MySQL)
// 2. Add MySQL activities table creation (run once, or ensure exists)
db.query(`CREATE TABLE IF NOT EXISTS activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255),
  action VARCHAR(255),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  details TEXT
)`, (err) => {
  if (err) console.error('Failed to ensure activities table:', err.message);
});

// 3. Middleware to log activity to MySQL
dbLogActivity = (req, res, next) => {
  if (req.method !== 'OPTIONS') {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const action = req.method + ' ' + req.originalUrl;
    const details = JSON.stringify(req.body || {});
    db.query(
      'INSERT INTO activities (user_id, action, details) VALUES (?, ?, ?)',
      [userId, action, details],
      (err) => { if (err) console.error('Activity log error:', err.message); }
    );
  }
  next();
};
app.use(dbLogActivity);

// API to fetch students with pagination
app.get('/api/students', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const size = parseInt(req.query.size) || 5;
  const offset = (page - 1) * size;

  db.query(
    'SELECT * FROM students LIMIT ? OFFSET ?',
    [size, offset],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      db.query('SELECT COUNT(*) as total FROM students', (err2, countRes) => {
        if (err2) return res.status(500).json({ error: err2 });
        const total = countRes[0].total;
        res.json({
          students: results,
          totalPages: Math.ceil(total / size),
          currentPage: page,
        });
      });
    }
  );
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// GET /api/students/:id
app.get('/api/students/:id', (req, res) => {
  const studentId = req.params.id;
  const query = `SELECT * FROM students WHERE id = ?`;
  db.query(query, [studentId], (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.status(200).json(result[0]);
  });
});


 // PUT /api/students/:id
app.put('/api/students/:id', (req, res) => {
  const studentId = req.params.id;
  const {
    full_name,
    roll_number,
    department,
    degree_title,
    dob,
    city,
    interest,
    start_date,
    end_date,
    photo,
    email,
    gender,
    subject
  } = req.body;
  const query = `UPDATE students SET full_name = ?, roll_number = ?, department = ?, degree_title = ?, dob = ?, city = ?, interest = ?, start_date = ?, end_date = ?, photo = ?, email = ?, gender = ?, subject = ? WHERE id = ?`;
  db.query(query, [full_name, roll_number, department, degree_title, dob, city, interest, start_date, end_date, photo, email, gender, subject, studentId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to update student' });
    }
    res.status(200).json({ message: 'Student updated successfully' });
  });
});

  // DELETE /api/students/:id
app.delete('/api/students/:id', (req, res) => {
  const studentId = req.params.id;
  // Assuming you're using MariaDB or MySQL
  const query = `DELETE FROM students WHERE id = ?`;
  db.query(query, [studentId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete student' });
    }
    res.status(200).json({ message: 'Student deleted successfully' });
  });
});

// Set up storage for uploaded images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save to my-react-app/src/uploads
    cb(null, path.join(__dirname, '../my-react-app/src/uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Serve static files from uploads
app.use('/uploads', express.static(path.join(__dirname, '../my-react-app/src/uploads')));

// POST /api/students (with file upload)
app.post('/api/students', upload.single('photo'), (req, res) => {
  const {
    full_name,
    roll_number,
    email,
    gender,
    dob,
    city,
    interest,
    department,
    degree_title,
    subject,
    start_date,
    end_date
  } = req.body;

  // Validate required fields (optional, but recommended)
  if (!full_name || !roll_number) {
    return res.status(400).json({ error: 'Full name and roll number are required.' });
  }

  // Store only the relative path to the uploaded image
  let photoPath = null;
  if (req.file) {
    photoPath = '/uploads/' + req.file.filename;
  }

  // Ensure date fields are either null or valid date strings
  const dobValue = dob && dob !== '' ? dob : null;
  const startDateValue = start_date && start_date !== '' ? start_date : null;
  const endDateValue = end_date && end_date !== '' ? end_date : null;

  const query = `INSERT INTO students (full_name, roll_number, email, gender, dob, city, interest, department, degree_title, subject, start_date, end_date, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(query, [full_name, roll_number, email, gender, dobValue, city, interest, department, degree_title, subject, startDateValue, endDateValue, photoPath], (err, result) => {
    if (err) {
      console.error('SQL Error:', err);
      return res.status(500).json({ error: 'Failed to add student', details: err.message });
    }
    res.status(201).json({ message: 'Student added successfully', studentId: result.insertId });
  });
});

// Dashboard stats endpoint
app.get('/api/dashboard-stats', async (req, res) => {
  try {
    // Top 5 interests (ignore null/empty)
    const [topInterests] = await db.promise().query(
      `SELECT interest, COUNT(*) as cnt FROM students WHERE interest IS NOT NULL AND interest != '' GROUP BY interest ORDER BY cnt DESC LIMIT 5`
    );
    // Bottom 5 interests (ignore null/empty)
    const [bottomInterests] = await db.promise().query(
      `SELECT interest, COUNT(*) as cnt FROM students WHERE interest IS NOT NULL AND interest != '' GROUP BY interest ORDER BY cnt ASC LIMIT 5`
    );
    // Distinct interests
    const [distinctInterests] = await db.promise().query(
      `SELECT COUNT(DISTINCT interest) as cnt FROM students WHERE interest IS NOT NULL AND interest != ''`
    );
    // Provincial distribution (ignore null/empty)
    const [provincialDistribution] = await db.promise().query(
      `SELECT city as name, COUNT(*) as value FROM students WHERE city IS NOT NULL AND city != '' GROUP BY city`
    );
    // Submissions chart (last 30 days)
    const [submissionsChart] = await db.promise().query(
      `SELECT DATE(start_date) as date, COUNT(*) as count FROM students WHERE start_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND start_date IS NOT NULL GROUP BY DATE(start_date) ORDER BY date`
    );
    // Age distribution (ignore null)
    const [ageDistribution] = await db.promise().query(
      `SELECT YEAR(CURDATE()) - YEAR(dob) as age, COUNT(*) as count FROM students WHERE dob IS NOT NULL GROUP BY age ORDER BY age`
    );
    // Department distribution (ignore null/empty)
    const [departmentDistribution] = await db.promise().query(
      `SELECT department as name, COUNT(*) as value FROM students WHERE department IS NOT NULL AND department != '' GROUP BY department`
    );
    // Degree distribution (ignore null/empty)
    const [degreeDistribution] = await db.promise().query(
      `SELECT degree_title as name, COUNT(*) as value FROM students WHERE degree_title IS NOT NULL AND degree_title != '' GROUP BY degree_title`
    );
    // Gender distribution (ignore null/empty)
    const [genderDistribution] = await db.promise().query(
      `SELECT gender as name, COUNT(*) as value FROM students WHERE gender IS NOT NULL AND gender != '' GROUP BY gender`
    );
    // Last 30 days activity (actions per day)
    const [last30DaysActivity] = await db.promise().query(
      `SELECT DATE(timestamp) as date, COUNT(*) as count FROM activities WHERE timestamp >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY DATE(timestamp) ORDER BY date`
    );
    // Last 24 hours activity (actions per 15 min)
    const [last24HoursActivity] = await db.promise().query(
      `SELECT DATE_FORMAT(timestamp, '%H:%i') as time, COUNT(*) as count FROM activities WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR) GROUP BY HOUR(timestamp), FLOOR(MINUTE(timestamp)/15) ORDER BY time`
    );
    // Student status grid
    const [studying] = await db.promise().query(`SELECT COUNT(*) as count FROM students WHERE end_date IS NULL OR end_date > CURDATE()`);
    const [recentlyEnrolled] = await db.promise().query(`SELECT COUNT(*) as count FROM students WHERE start_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)`);
    const [aboutToGraduate] = await db.promise().query(`SELECT COUNT(*) as count FROM students WHERE end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 MONTH)`);
    const [graduated] = await db.promise().query(`SELECT COUNT(*) as count FROM students WHERE end_date < CURDATE()`);
    // Most/least/dead hours in last 30 days
    const [hourlyActivity] = await db.promise().query(
      `SELECT HOUR(timestamp) as hour, COUNT(*) as count FROM activities WHERE timestamp >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY hour`
    );
    const sortedHours = [...hourlyActivity].sort((a, b) => b.count - a.count);
    const mostActiveHours = sortedHours.slice(0, 4).map(h => `${h.hour}:00`);
    const leastActiveHours = sortedHours.slice(-4).map(h => `${h.hour}:00`);
    const deadHours = hourlyActivity.filter(h => h.count === 0).map(h => `${h.hour}:00`);

    res.json({
      topInterests: topInterests.map(i => i.interest),
      bottomInterests: bottomInterests.map(i => i.interest),
      distinctInterests: distinctInterests[0]?.cnt || 0,
      provincialDistribution,
      submissionsChart,
      ageDistribution,
      departmentDistribution,
      degreeDistribution,
      genderDistribution,
      last30DaysActivity,
      last24HoursActivity,
      studentStatus: [
        { status: 'Studying', count: studying[0]?.count || 0 },
        { status: 'Recently enrolled', count: recentlyEnrolled[0]?.count || 0 },
        { status: 'About to graduate', count: aboutToGraduate[0]?.count || 0 },
        { status: 'Graduated', count: graduated[0]?.count || 0 }
      ],
      mostActiveHours,
      leastActiveHours,
      deadHours
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats', details: err.message });
  }
});