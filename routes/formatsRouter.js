const {Router} = require("express");
const formatsRouter = Router();
const formatsController = require("../controllers/formatsController");
const {cacheControl} = require("../middleware/index");

formatsRouter.use("/", cacheControl());
formatsRouter.get("/", formatsController.formatsGet);

module.exports = formatsRouter;