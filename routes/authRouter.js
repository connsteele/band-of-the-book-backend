const {Router} = require("express");
const authRouter = Router();
const authController = require("../controllers/authController");
const {loginValidation} = require("../middleware/validation")

authRouter.post("/login", loginValidation, authController.login);
authRouter.get("/logout", authController.logout);
authRouter.post("/signup", authController.signup);


module.exports = authRouter;