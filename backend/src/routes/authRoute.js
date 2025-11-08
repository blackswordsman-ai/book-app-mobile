import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
};

router.post("/register", async (req, res) => {
  try {
    const { email, userName, password } = req.body;
    if (!email || !userName || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    if (userName.length < 3) {
      return res
        .status(400)
        .json({ message: "Username must be at least 3 characters long" });
    }

    // check if user alredy exists
    //    const exisitingUser= await User.findOne({$or:[{email:email},{userName:userName}]});
    //    if(exisitingUser) return res.status(400).json({message:"User already exists"});
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const existingUserName = await User.findOne({ userName });
    if (existingUserName) {
      return res.status(400).json({ message: "Username already exists" });
    }

    //get a random avatar
    const profileImage = `https://api.dicebear.com/9.x/big-ears/svg?seed=${userName}`;
    
    const user = new User({
      email,
      userName,
      password,
      profileImage,
    });

    
    await user.save();
    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.log("Error in register route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  res.send("login");
});

export default router;
