require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");
const { instrument } = require("@socket.io/admin-ui");
const UserReg = require("./Model/fullReguserModel");
const fs = require('fs');
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log("Connected to MongoDB!"))
  .catch((err) => console.log(err.message));
console.log(process.env.MONGODB_URI);

const socketApi = require("./socket.io");

const port = process.env.PORT || 3001;
console.log(process.env.PORT);


const server = app.listen(process.env.PORT, () => {
  
  console.log(`App running on port ${port}!`);
});
const io = socketApi.init(server, {
  cors: {
    origin: '*',
    // credentials: true
  }
});

instrument(io, {
  auth: false
});


io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.on("newAddress", (data) => {
    const timestamp = Date.now();
    let date = new Date(timestamp);
    let logTime = date.toUTCString();
    let logEntry = `[${logTime}] ${JSON.stringify(data)}\n`;
    // data.timestamp = timestamp;
    fs.appendFile('./views/logs/currentAddress.logs.txt',  logEntry + '\n', (err) => {
      if (err) throw err;
      console.log('The data was appended to file!');
    });
    console.log("Data>>>>", data);
    const id = data.id;
    const options = { new: true };
    const result = UserReg.findByIdAndUpdate(
      id,
      { address: data.address },
      (err, options) => {
        if (err) throw err;
        console.log("Error thrown", err)
        console.log("User address updated");
      }
    );
    console.log("Address updated successfully");
    socket.emit("address_updated", { message: "Address updated successfully" });
  });
});

