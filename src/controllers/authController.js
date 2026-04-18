import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const register = async (req, res) => {
  const { fullName, email, password, role } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already in use" });

    const user = await User.create({ fullName, email, password, role });
    res.status(201).json({
      _id: user._id,
      fullName: user.fullName, 
      email: user.email,
      role: user.role,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
      token: generateToken(user._id),
    });

  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
      skills: user.skills,
      interests: user.interests,
      location: user.location,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const completeOnboarding = async (req, res) => {
  const { skills, interests, location } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.skills = skills || [];
    user.interests = interests || [];
    user.location = location || "";
    user.hasCompletedOnboarding = true;
    await user.save();

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
      skills: user.skills,
      interests: user.interests,
      location: user.location,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
