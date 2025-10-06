const {Router} = require("express");
const booksRouter = Router();
const booksController = require("../controllers/booksController");

// Get the collection
// booksRouter.get("/", );

booksRouter.get("/search", booksController.searchBook);
booksRouter.get("/:id", booksController.readBook);

module.exports = booksRouter;