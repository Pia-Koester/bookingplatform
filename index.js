//importing database
require("./db.js");

//general express app setup
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");

//Import Routers
const userRouter = require("./routes/users-routes.js");
const activityRouter = require("./routes/activities-routes.js");
const membershipPlanRouter = require("./routes/membershipPlans-routes.js");
const userMembershipRouter = require("./routes/userMemberships-routes.js");
const typeRouter = require("./routes/activityTypes-routes.js");
const { connectDB } = require("./db.js");
const instructorRouter = require("./routes/instructor-routes.js");

//Middlewares
app.use(
  cors({
    origin: ["http://localhost:5173", "https://artemis-sports.de"],

    credentials: true,
  })
);
app.use(express.json({ limit: "200kb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api", userRouter);
app.use("/api/activities", activityRouter);
app.use("/api/membershipplan", membershipPlanRouter); //TO DO: naming in url too long?
app.use("/api/usermemberships", userMembershipRouter);
app.use("/api/types", typeRouter);
app.use("/api/instructors", instructorRouter);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`);
  });
});
