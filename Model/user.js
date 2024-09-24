import mongoose, { Schema } from "mongoose";
import bcrpyt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
  name: { type: String, required: [true, "name is requiredd"] },
  password: { type: String, required: [true, "password is required"] },
});

userSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret, options) {
    const { name } = ret;
    return { name };
  },
});

userSchema.pre("create", async function (next) {
  try {
    if (this.isModified("password")) {
      const salt = await bcrpyt.genSalt(10);
      this.password = await bcrpyt.hash(this.password, salt);
    }
    next();
  } catch (e) {
    next(e);
  }
});

userSchema.statics.findCredentials = async (name, password) => {
  const user = await usermodel.findOne({ name });
  const checkpassword = await bcrpyt.compare(password, user.password);
  if (!checkpassword) {
    throw new Error("SOmething went wrong");
  }
  return user;
};

userSchema.methods.generateaccesstoken = function () {
  const user = this;
  const accesstoken = jwt.sign(
    {
      name: user.name,
      _id: user._id,
    },
    process.env.AUTH_ACCESS_TOKEN,
    {
      expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY,
    }
  );
  return accesstoken;
};

userSchema.methods.generaterefreshtoken = function () {
  const user = this;
  const refreshtoken = jwt.sign(
    {
      name: user.name,
      _id: user._id,
    },
    process.env.AUTH_REFRESH_TOKEN,

    {
      expiresIn: process.env.AUTH_REFRESH_TOKEN_EXPIRY,
    }
  );
  return refreshtoken;
};

const usermodel = mongoose.model("User", userSchema);

export default usermodel;
