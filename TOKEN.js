import express from "express";
import { PORT, MONGODB_URL } from "./config.js";
import mongoose from "mongoose";
import usermodel from "./Model/user.js";
import dotenv from "dotenv";
const app = express();
app.use(express.json());
dotenv.config();

mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("database is now connected");
  })
  .catch(() => {
    console.log("something went wrong :<");
  });
let user;
app.post("/user", async (req, res) => {
  user = await usermodel.create(req.body);

  return res.status(200).json(user);
});

app.post("/login", async (req, res) => {
  const { name, password } = req.body;
  let user;
  try {
    user = await usermodel.findCredentials(name, password);
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Authentication error" });
  }

  let accesstoken = await user.generateaccesstoken();
  let refreshtoken = await user.generaterefreshtoken();

  return res
    .status(200)
    .json({ success: true, user, accesstoken, refreshtoken });
});

app.listen(PORT, () => {
  console.log(`The server has been connected to port: ${PORT}`);
});
