const {Router} = require("express");
const genresRouter = Router();
const controller = require("../controllers/genresController");

genresRouter.get("/", controller.genresGet);

module.exports = genresRouter;