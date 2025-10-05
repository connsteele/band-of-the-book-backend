const {Router} = require("express");
const postsController = require("../controllers/postsController");
const {cacheControl} = require("../middleware/index");
const postsRouter = Router();

postsRouter.use(cacheControl());
postsRouter.get("/", postsController.readPosts);


module.exports = postsRouter;