const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token;

  // Check karna ke Header mein "Bearer <token>" bhej raha hai frontend ya nahi
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
   
      token = req.headers.authorization.split(" ")[1];

  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
      req.user = decoded;

      // Agle step/controller par jaanay dena
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };