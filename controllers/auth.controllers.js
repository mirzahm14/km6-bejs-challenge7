const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getHTML, sendEmail } = require("../libs/nodemailer");
const { JWT_SECRET } = process.env;

module.exports = {
  register: async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({
          status: false,
          message: "All fields are required",
        });
      }

      const isEmailExist = await prisma.user.findUnique({ where: { email } });
      if (isEmailExist) {
        return res.status(400).json({
          status: false,
          message: "Email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          notifications: {
            create: {
              title: "Registration Success",
              description: `Welcome, ${name}!`,
            },
          },
        },
      });

      if (!result) {
        return res.status(400).json({
          status: false,
          message: "User failed to create",
        });
      }

      res.redirect("/api/v1/login");
    } catch (err) {
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          status: false,
          message: "All fields are required",
        });
      }

      const isEmailExist = await prisma.user.findUnique({ where: { email } });
      if (!isEmailExist) {
        return res.status(400).json({
          status: false,
          message: "Email or Password is wrong",
        });
      }

      const isPasswordMatch = await bcrypt.compare(
        password,
        isEmailExist.password,
      );
      if (!isPasswordMatch) {
        return res.status(400).json({
          status: false,
          message: "Email or Password is wrong",
        });
      }

      delete isEmailExist.password;
      const token = jwt.sign({email: isEmailExist.email }, JWT_SECRET,);

      res.redirect(`/api/v1/home?token=${token}`);
    } catch (err) {
      next(err);
    }
  },

  whoami: (req, res, next) => {
    try {
      res.json({
        status: true,
        message: "OK",
        data: req.user,
      });
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async (req, res, next) => {
    try {
      const id = req.user.id;
      const {password, password2} = req.body
      if (password !== password2) {
        return res.send("<h1>Password didn't match</h1>");
      }

      const hashedNewPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        data: {
          password: hashedNewPassword},
        where: {id},
      });

      const notification = await prisma.notification.create({
        data: {
          user_id: id,
          title: "Reset Password Success",
          description: "Successfully reset your password",
        }
      })

      console.log('server id:', id)
      req.io.emit(`notification_${id}`, notification)

      res.send("<h1>Success reset password</h1>");
    } catch (err) {
      next(err);
    }
  },

  requestResetPassword: async (req, res, next) => {
    try {
      const { email } = req.body;

      const isEmailExist = await prisma.user.findUnique({ where: { email } });
      if (!isEmailExist) {
        return res.status(400).json({
          status: false,
          message: "Email is not exist",
        });
      }

      const token = jwt.sign({ email }, JWT_SECRET);
      const url = `${req.protocol}://${req.get(
        "host",
      )}/api/v1/reset-password?token=${token}`;
      const html = await getHTML("reset-password-template.ejs", {
        name: isEmailExist.name,
        verification_url: url,
      });

      await sendEmail(email, "Reset Password", html);

      res.render("forgot-password", {
        layout: "layouts/main",
        title: "Request Reset Password",
        isEmailSent: true,
      });
    } catch (err) {
      next(err);
    }
  },
};
