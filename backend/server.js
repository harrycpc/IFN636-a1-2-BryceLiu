//fix for DNS issue causing mongodb connection to fail
const dns = require('node:dns/promises');
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();


const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/api/auth', require('./routes/authRoutes'));
//app.use('/api/tasks', require('./routes/taskRoutes'));
app.use("/api/cars", require("./routes/carRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));

// Export the app object for testing
if (require.main === module) {
    connectDB.connect();
    // If the file is run directly, start the server
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }


module.exports = app
