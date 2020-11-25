const mongoose = require("mongoose");

const connectDB = async () => {
  const connection = await mongoose.connect(process.env.MONGODB_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });

  console.log(
    `MongoDb connected: ${connection.connection.host}`.yellow.underline.bold
  );
};

module.exports = connectDB;
