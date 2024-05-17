const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { JWT_SECRET } = process.env;

module.exports = {
  authenticateTokenQuery: async (req, res, next) => {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({
        status: false,
        message: "Unauthorized",
      });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(400).json({ status: false, message: err });
      }

      const user = await prisma.user.findUnique({
        where: { email: decoded.email },
        select: {
          id: true,
          name: true,
          email: true,
          notifications: true,
        },
      });
      req.user = user;
      next();
    });
  },
};
