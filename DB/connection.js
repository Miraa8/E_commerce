import mongoose from "mongoose";

export const connectDb = async () => {
  return await mongoose
    .connect(process.env.connection_url)
    .then(() => console.log("DB connected successfully"))
    .catch(() => console.log("failed to connect DB!"));
};
