const hrAccess = (req, res, next) => {
  // If user is admin, manager or has explicit HR role, allow access
  if (req.user && (req.user.role === 'admin' || req.user.role === 'manager' || req.user.role === 'hr')) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Access denied: Requires Admin, Manager or HR privileges',
  });
};

module.exports = hrAccess;
