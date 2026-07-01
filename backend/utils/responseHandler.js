const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      year: user.year,
      branch: user.branch,
      avatar: user.avatar,
    },
  });
};

module.exports = sendTokenResponse;
