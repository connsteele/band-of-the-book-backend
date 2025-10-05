const {Router} = require("express");
const usersRouter = Router();
const postsControl = require("../controllers/postsController");

usersRouter.post("/:userId/posts", postsControl.createPostForUser);

module.exports = usersRouter;