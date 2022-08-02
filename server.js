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

// //establish socket.io connection
// const server = require("http").createServer(app);
// const io = require("socket.io")(server);

// io.of("/api/socket").on("connection", (socket) => {
//   console.log("socket.io: User connected: ", socket.id);

//   socket.on("disconnect", () => {
//     console.log("socket.io: User disconnected: ", socket.id);
//   });
// });

app.listen(process.env.PORT || 3001, () => {
  console.log(`App running on port ${port}!`);
});

const connection = mongoose.connection;

connection.once("open", () => {
  console.log("MongoDB database connected");

  console.log("Setting change streams");
  const updateLocationStream = connection.collection("thoughts").watch();

  updateLocationStream.on("change", (change) => {
    switch (change.operationType) {
      case "insert":
        const address = {
          _id: change.fullDocument._id,
          long: change.fullDocument.long,
          lat: change.fullDocument.lat
        };

        io.of("/api/socket").emit("newAddress", address);
        break;

      case "delete":
        io.of("/api/socket").emit("deletedAddress", change.documentKey._id);
        break;
    }
  })
});








  // connection.once("open", () => {
  //   console.log("MongoDB database connected");

  //   console.log("Setting change streams");
  //   const thoughtChangeStream = connection.collection("thoughts").watch();

  //   thoughtChangeStream.on("change", (change) => {
  //     switch (change.operationType) {
  //       case "insert":
  //         const thought = {
  //           _id: change.fullDocument._id,
  //           name: change.fullDocument.name,
  //           description: change.fullDocument.description,
  //         };

  //         io.of("/api/socket").emit("newThought", thought);
  //         break;

  //       case "delete":
  //         io.of("/api/socket").emit("deletedThought", change.documentKey._id);
  //         break;
  //     }
  //   });
  // });