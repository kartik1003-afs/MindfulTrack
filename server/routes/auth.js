// const express = require('express');
// const router = express.Router();
// const jwt = require('jsonwebtoken');
// const { body, validationResult } = require('express-validator');
// const User = require('../models/User');
// const auth = require('../middleware/auth');

// // Debug middleware for auth routes


// // Register user
// router.post('/register', [
//   body('email').isEmail().normalizeEmail(),
//   body('password').isLength({ min: 6 }),
//   body('name').trim().notEmpty()
// ], async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       console.log('Registration validation errors:', errors.array());
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { email, password, name } = req.body;
//     console.log('Registration attempt for:', { email, name });

//     // Check if user already exists
//     let user = await User.findOne({ email });
//     if (user) {
//       console.log('User already exists:', email);
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     // Create new user
//     user = new User({ email, password, name });
//     await user.save();
//     console.log('User created successfully:', email);

//     // Generate tokens
//     const accessToken = jwt.sign(
//       { userId: user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     const refreshToken = jwt.sign(
//       { userId: user._id },
//       process.env.JWT_REFRESH_SECRET,
//       { expiresIn: '7d' }
//     );

//     // Save refresh token
//     user.refreshToken = refreshToken;
//     await user.save();

//     res.status(201).json({
//       accessToken,
//       refreshToken,
//       user: {
//         id: user._id,
//         email: user.email,
//         name: user.name
//       }
//     });
//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Login user
// router.post('/login', [
//   body('email').isEmail().normalizeEmail(),
//   body('password').exists()
// ], async (req, res) => {
//   try {
//     console.log('Login request received:', req.body);
    
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       console.log('Login validation errors:', errors.array());
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { email, password } = req.body;
//     console.log('Login attempt for:', email);

//     // Find user
//     const user = await User.findOne({ email });
//     if (!user) {
//       console.log('User not found:', email);
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     // Check password
//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       console.log('Invalid password for user:', email);
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     console.log('Login successful for:', email);

//     // Generate tokens
//     const accessToken = jwt.sign(
//       { userId: user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     const refreshToken = jwt.sign(
//       { userId: user._id },
//       process.env.JWT_REFRESH_SECRET,
//       { expiresIn: '7d' }
//     );

//     // Save refresh token
//     user.refreshToken = refreshToken;
//     await user.save();

//     res.json({
//       accessToken,
//       refreshToken,
//       user: {
//         id: user._id,
//         email: user.email,
//         name: user.name
//       }
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Refresh token
// router.post('/refresh-token', async (req, res) => {
//   try {
//     const { refreshToken } = req.body;
//     if (!refreshToken) {
//       return res.status(401).json({ message: 'Refresh token required' });
//     }

//     const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
//     const user = await User.findById(decoded.userId);

//     if (!user || user.refreshToken !== refreshToken) {
//       return res.status(401).json({ message: 'Invalid refresh token' });
//     }

//     const accessToken = jwt.sign(
//       { userId: user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     res.json({ accessToken });
//   } catch (error) {
//     res.status(401).json({ message: 'Invalid refresh token' });
//   }
// });

// // Get current user
// router.get('/me', auth, async (req, res) => {
//   res.json({
//     user: {
//       id: req.user._id,
//       email: req.user.email,
//       name: req.user.name
//     }
//   });
// });

// module.exports = router; 


















const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Register user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({ email, password, name });
    await user.save();

    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Refresh token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// Get current user
router.get('/me', auth, (req, res) => {
  res.json({ user: { id: req.user._id, email: req.user.email, name: req.user.name } });
});

module.exports = router;







































// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const auth = async (req, res, next) => {
//   try {
//     let token;

//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//       token = req.headers.authorization.split(' ')[1];
//     } else if (req.cookies && req.cookies.token) {
//       token = req.cookies.token;
//     }

//     if (!token) {
//       return res.status(401).json({ message: 'No token. Access denied.' });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
//     // 🔥 Use decoded.userId here!
//     const user = await User.findById(decoded.userId).select('-password');
//     if (!user) {
//       return res.status(401).json({ message: 'Invalid token. User not found.' });
//     }

//     req.user = user;
//     next();
//   } catch (err) {
//     console.error('Auth Middleware Error:', err.message);
//     return res.status(401).json({ message: 'Invalid or expired token' });
//   }
// };

// module.exports = auth;
