const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().optional(),
});
// backend/validators/auth.schema.js — EDIT, add these to the existing file alongside loginSchema/registerSchema
const sendOtpSchema = z.object({ email: z.string().email('Valid email required') });
const verifyOtpSchema = z.object({ email: z.string().email(), otp: z.string().min(1) });
const googleLoginSchema = z.object({ token: z.string().min(1, 'Google token required') });
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});
module.exports = { loginSchema, registerSchema, sendOtpSchema, verifyOtpSchema, googleLoginSchema, changePasswordSchema };