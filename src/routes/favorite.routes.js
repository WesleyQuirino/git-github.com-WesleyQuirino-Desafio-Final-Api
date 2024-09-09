const { Router } = require("express");
const FavController = require("../controller/FavController");

const authenticated = require("../middleware/authenticated");

const favRoutes = new Router();
const favController = new FavController();

favRoutes.use(authenticated);
favRoutes.post("/:id", favController.create);

module.exports = favRoutes;