const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();
  //console.log('Token generated:', token);
  // Parse JWT_EXPIRE correctly (handle '30d' format)
  const expiresInDays = parseInt(process.env.JWT_EXPIRE) || 30; // Fallback to 30 days
  
  const options = {
    expires: new Date(
      Date.now() + expiresInDays * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }
           
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      data: user // Send the entire user object if needed
    });
};

module.exports = sendTokenResponse;