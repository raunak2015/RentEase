const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user (Tenant or Owner)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Input Validation
    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide all required fields: name, email, phone, password, role',
      });
    }

    if (!['tenant', 'owner'].includes(role)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Role must be either tenant or owner',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        status: 'fail',
        message: 'An account with this email address already exists',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
    });

    if (user) {
      const token = generateToken(user._id, user.role);

      res.status(201).json({
        status: 'success',
        message: 'Account created successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profileImage: user.profileImage,
          bio: user.bio,
          token,
        },
      });
    } else {
      res.status(400).json({
        status: 'fail',
        message: 'Invalid user data provided',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Input Validation
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide both email and password',
      });
    }

    // Find user & include password for verification
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password credentials',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        bio: user.bio,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User profile not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    user.profileImage = req.body.profileImage || user.profileImage;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
        bio: updatedUser.bio,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request password reset link/OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide your registered email address',
      });
    }

    const user = await User.findOne({ email });

    // Always respond with success message for security (prevent email enumeration)
    res.status(200).json({
      status: 'success',
      message: 'If an account exists with this email, password reset instructions have been sent.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user favorite properties
// @route   GET /api/users/favorites
// @access  Private
const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      populate: { path: 'ownerId', select: 'name email phone profileImage' },
    });

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      results: user.favorites ? user.favorites.length : 0,
      data: user.favorites || [],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add property to favorites
// @route   POST /api/users/favorites/:propertyId
// @access  Private
const addFavorite = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    // Add to favorites if not already present
    if (!user.favorites.includes(propertyId)) {
      user.favorites.push(propertyId);
      await user.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'Property added to favorites',
      data: user.favorites,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove property from favorites
// @route   DELETE /api/users/favorites/:propertyId
// @access  Private
const removeFavorite = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    user.favorites = user.favorites.filter(
      (fav) => fav.toString() !== propertyId.toString()
    );
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Property removed from favorites',
      data: user.favorites,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete logged-in user account
// @route   DELETE /api/users/profile
// @access  Private
const deleteUserAccount = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User account permanently deleted',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  getFavorites,
  addFavorite,
  removeFavorite,
  deleteUserAccount,
};
