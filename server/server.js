const express = require('express');
const postgres = require('postgres');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// --- Socket.io Setup ---
const io = new Server(server, {
  cors: {
    origin: "*", // उत्पादनासाठी (Production) नंतर मर्यादित करा
    methods: ["GET", "POST"]
  }
});

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Supabase Connection ---
// टीप: तुझी ही लिंक एकदम बरोबर आहे.
const DATABASE_URL = "postgresql://postgres:Rameshwarthombre88@@db.mruzthoepspwbxqciksk.supabase.co:5432/postgres";
const sql = postgres(DATABASE_URL);

// --- Socket Connection Logic ---
io.on("connection", (socket) => {
  console.log("⚡ User Connected:", socket.id);
  socket.on("disconnect", () => console.log("User disconnected"));
});

// --- Home Route ---
app.get("/", (req, res) => {
  res.send("<h1 style='text-align:center; font-family:sans-serif; color:#2563eb;'>🚀 WorkForce Supabase Server is LIVE!</h1>");
});

// --- 3. ADMIN APIs ---

app.get("/api/admin/stats", async (req, res) => {
  try {
    // Postgres मध्ये 'FROM DUAL' नसते, आपण सरळ क्वेरी किंवा 'FROM (SELECT 1) as dual' वापरू शकतो.
    const stats = await sql`
      SELECT 
        (SELECT COUNT(*) FROM register) as "totalUsers",
        (SELECT COUNT(*) FROM register WHERE role = 'specialist') as "totalWorkers",
        (SELECT COUNT(*) FROM bookings) as "totalBookings",
        (SELECT COUNT(*) FROM register WHERE last_seen > NOW() - INTERVAL '2 minutes') as "totalLive",
        (SELECT COALESCE(SUM(id * 50), 0) FROM bookings WHERE status = 'Completed') as revenue 
    `;
    res.json({ success: true, stats: stats[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/admin/all-users", async (req, res) => {
  try {
    const results = await sql`SELECT full_name, role, trade, phone, email, address, last_seen FROM register ORDER BY created_at DESC`;
    res.json({ success: true, users: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ MyTasks.jsx च्या 404 एररसाठी
app.get("/api/admin/bookings", async (req, res) => {
  try {
    const results = await sql`SELECT * FROM bookings ORDER BY id DESC`;
    res.json(results);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/admin/all-bookings", async (req, res) => {
  try {
    const results = await sql`SELECT * FROM bookings ORDER BY id DESC`;
    res.json({ success: true, bookings: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/update-last-seen", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).send("Phone required");
  try {
    await sql`UPDATE register SET last_seen = NOW() WHERE phone = ${phone}`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// --- 4. Worker Discovery ---
app.get("/api/workers", async (req, res) => {
  const { trade } = req.query;
  try {
    let workers;
    if (trade && trade !== "All") {
      workers = await sql`SELECT full_name, phone, trade, experience_years, skills, address, role FROM register WHERE role = 'specialist' AND trade = ${trade}`;
    } else {
      workers = await sql`SELECT full_name, phone, trade, experience_years, skills, address, role FROM register WHERE role = 'specialist'`;
    }
    res.json({ success: true, workers: workers });
  } catch (err) {
    res.status(500).json({ success: false, error: "डेटा मिळवताना अडचण आली." });
  }
});

// --- 5. Booking APIs ---
app.post("/api/book-worker", async (req, res) => {
  const { client_phone, worker_phone, worker_name, work_location, booking_date, booking_time } = req.body;
  if (!client_phone || !worker_phone || !work_location) {
    return res.status(400).json({ success: false, error: "सर्व माहिती भरणे आवश्यक आहे! ⚠️" });
  }

  try {
    const result = await sql`
      INSERT INTO bookings (client_phone, worker_phone, worker_name, work_location, booking_date, booking_time, status, created_at) 
      VALUES (${client_phone}, ${worker_phone}, ${worker_name}, ${work_location}, ${booking_date}, ${booking_time}, 'Pending', NOW())
      RETURNING id
    `;

    // ✅ Real-time Notification
    io.emit("newBooking", { worker_phone, message: "तुम्हाला नवीन बुकिंग आले आहे!" });
    res.json({ success: true, message: "Booking Request Sent! ✅", bookingId: result[0].id });
  } catch (err) {
    res.status(500).json({ success: false, error: "बुकिंग सेव्ह करताना तांत्रिक अडचण आली." });
  }
});

app.get("/api/my-bookings/:phone", async (req, res) => {
  const phone = req.params.phone;
  try {
    const results = await sql`SELECT * FROM bookings WHERE client_phone = ${phone} OR worker_phone = ${phone} ORDER BY id DESC`;
    res.json({ success: true, bookings: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/update-booking-status", async (req, res) => {
  const { id, status } = req.body;
  const allowedStatuses = ["Pending", "Accepted", "Cancelled", "Completed", "Rejected"];
  if (!id || !allowedStatuses.includes(status)) return res.status(400).json({ success: false, error: "Invalid Data" });

  try {
    await sql`UPDATE bookings SET status = ${status} WHERE id = ${id}`;
    res.json({ success: true, message: `Status updated to ${status} ✅` });
  } catch (err) {
    res.status(500).json({ success: false, error: "अपडेट अयशस्वी." });
  }
});

// --- 6. Auth APIs ---
app.post("/api/register", async (req, res) => {
  const { phone, email, name, role, password, address, trade } = req.body;
  try {
    await sql`
      INSERT INTO register (phone, email, full_name, role, password, trade, address, created_at, last_seen) 
      VALUES (${phone}, ${email}, ${name}, ${role}, ${password}, ${trade}, ${address}, NOW(), NOW())
    `;
    res.json({ success: true, message: "Success! ✅" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Registration Failed." });
  }
});

app.post("/api/login", async (req, res) => {
  const { phone, password } = req.body;
  try {
    const results = await sql`SELECT * FROM register WHERE phone = ${phone} OR email = ${phone}`;
    if (results.length > 0) {
      const user = results[0];
      if (password === user.password) {
        await sql`UPDATE register SET last_seen = NOW() WHERE phone = ${user.phone}`;
        res.json({ success: true, user });
      } else {
        res.status(401).json({ success: false, error: "Incorrect password" });
      }
    } else {
      res.status(404).json({ success: false, error: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: "Login failed." });
  }
});

// --- 7. Profile APIs ---
app.put("/api/update-profile", async (req, res) => {
  const { phone, email, name, trade, address, experience_years, skills } = req.body;
  try {
    await sql`
      UPDATE register 
      SET full_name = ${name}, email = ${email}, trade = ${trade}, address = ${address}, experience_years = ${experience_years}, skills = ${skills} 
      WHERE phone = ${phone}
    `;
    res.json({ success: true, message: "Profile Updated! ✨" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Update Failed." });
  }
});

app.get("/api/profile/:phone", async (req, res) => {
  try {
    const results = await sql`SELECT * FROM register WHERE phone = ${req.params.phone}`;
    res.json({ success: true, profile: results[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error" });
  }
});

// --- Global Error Handling ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: "Server Error!" });
});

const PORT = 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 WorkForce Server is running on port ${PORT}`);
});