require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
    .then(() => console.log("Connected to MongoDB!"))
    .catch((err) => console.log(err.message));
  console.log(process.env.MONGODB_URI);


const port = process.env.PORT || 3001;

app.listen(process.env.PORT || 3001, () => {
  console.log(`App running on port ${port}!`);
});
