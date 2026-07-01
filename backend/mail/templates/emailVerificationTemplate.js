module.exports = (otp) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
  <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 8px; padding: 32px;">
    <h2 style="color: #1a1a1a;">Verify your IdeaHub account</h2>
    <p style="color: #555;">Use the OTP below to verify your email. It expires in 5 minutes.</p>
    <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4f46e5; margin: 24px 0; text-align: center;">
      ${otp}
    </div>
    <p style="color: #999; font-size: 12px;">If you didn't request this, ignore this email.</p>
  </div>
</body>
</html>`;
