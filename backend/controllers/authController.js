const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createSendToken } = require('../utils/auth');

// Error handling wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Register new user
const signup = catchAsync(async (req, res, next) => {
  console.log('🔵 SIGNUP REQUEST RECEIVED:', {
    body: req.body,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });

  const { name, email, password, confirmPassword } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide name, email and password'
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      status: 'fail',
      message: 'Passwords do not match'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      status: 'fail',
      message: 'Password must be at least 6 characters long'
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      status: 'fail',
      message: 'User with this email already exists'
    });
  }

  // Create new user
  console.log('🟢 CREATING USER IN DATABASE...');
  const newUser = await User.create({
    name,
    email,
    password
  });
  console.log('✅ USER CREATED SUCCESSFULLY:', newUser.email);

  createSendToken(newUser, 201, res);
});

// Login user
const login = catchAsync(async (req, res, next) => {
  console.log('🔐 LOGIN REQUEST RECEIVED:', { email: req.body.email });
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    console.log('❌ Missing email or password');
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide email and password'
    });
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    console.log('❌ User not found:', email);
    return res.status(401).json({
      status: 'fail',
      message: 'Incorrect email or password'
    });
  }

  console.log('✅ User found:', user.email);
  console.log('🔐 Checking password...');
  
  const isPasswordCorrect = await user.correctPassword(password, user.password);
  console.log('🔐 Password check result:', isPasswordCorrect);

  if (!isPasswordCorrect) {
    console.log('❌ Password incorrect');
    return res.status(401).json({
      status: 'fail',
      message: 'Incorrect email or password'
    });
  }

  // 3) Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // 4) If everything ok, send token to client
  createSendToken(user, 200, res);
});

// Logout user
const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({ 
    status: 'success',
    message: 'Logged out successfully'
  });
};

// Get current user
const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('healthRecordsCount');
  
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Update current user data
const updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return res.status(400).json({
      status: 'fail',
      message: 'This route is not for password updates. Please use /updateMyPassword.'
    });
  }

  // 2) Filter out unwanted fields that are not allowed to be updated
  const allowedFields = ['name', 'email', 'healthProfile', 'preferences'];
  const filteredBody = {};
  Object.keys(req.body).forEach(el => {
    if (allowedFields.includes(el)) {
      filteredBody[el] = req.body[el];
    }
  });

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// Update password
const updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return res.status(401).json({
      status: 'fail',
      message: 'Your current password is incorrect'
    });
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordChangedAt = new Date();
  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});

// Delete current user account
const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Forgot password
const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'There is no user with that email address'
    });
  }

  // 2) Generate the random reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email (implement email service)
  try {
    // TODO: Implement email sending
    console.log('Password reset token:', resetToken);
    
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email! (Check console for development)',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      status: 'error',
      message: 'There was an error sending the email. Try again later.'
    });
  }
});

// Reset password
const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return res.status(400).json({
      status: 'fail',
      message: 'Token is invalid or has expired'
    });
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = new Date();
  await user.save();

  // 3) Update changedPasswordAt property for the user (done in pre-save middleware)

  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

module.exports = {
  signup,
  login,
  logout,
  getMe,
  updateMe,
  updatePassword,
  deleteMe,
  forgotPassword,
  resetPassword
};
