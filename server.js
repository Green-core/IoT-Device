const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const db = require("./config/config.js")

const app = express()
const port = process.env.PORT || 5000

app.use(express.json())

mongoose.Promise = global.Promise
mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Successfully connected to the database")
  })
  .catch((err) => {
    console.log("Could not connect to the database. Exiting now...", err)
    process.exit()
  })

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get("/", (req, res) => {
  //testing
  res.json("Welcome to Green-Core IoT Device backend - testing  ")
})

// routes
const unitRoutes = require("./app/routes/unitRoutes");

// Use Routes
app.use("/units", unitRoutes);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
});
