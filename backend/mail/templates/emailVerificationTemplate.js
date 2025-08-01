module.exports = function emailTemplate(otp) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Email Verification</h2>
      <p>Your OTP code is:</p>
      <h1 style="color: #2e86de;">${otp}</h1>
      <p>This code will expire in 5 minutes. Please do not share it with anyone.</p>
    </div>
  `;
};
