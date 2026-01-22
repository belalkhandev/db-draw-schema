import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

interface RegisterRequest {
  name: string;
  email: string;
  contact_no: string;
  company_name?: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, contact_no, company_name, password }: RegisterRequest = req.body;

    if (!name || !email || !contact_no || !password) {
      res.status(400).json({ error: 'Please provide all required fields' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Please provide a valid email address' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    const user = await User.create({
      name,
      email,
      contact_no,
      company_name,
      password,
    });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        contact_no: user.contact_no,
        company_name: user.company_name,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Please provide email and password' });
      return;
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        contact_no: user.contact_no,
        company_name: user.company_name,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        contact_no: user.contact_no,
        company_name: user.company_name,
      },
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};
