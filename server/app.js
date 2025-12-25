const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const goalRoutes = require("./routes/goalRoutes");
const tipRoutes = require("./routes/tipRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/carbon", require("./routes/carbonRoutes"));

app.use("/api/goals", goalRoutes); // <-- Goals
app.use("/api/tips", tipRoutes);   // <-- Community / Tips
app.use("/api/notifications", notificationRoutes);


app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
