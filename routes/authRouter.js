const {Router} = require("express");
const authRouter = Router();
const authController = require("../controllers/authController");

authRouter.post("/login", authController.login);
authRouter.get("/logout", authController.logout);
authRouter.post("/signup", authController.signup);


module.exports = authRouter;