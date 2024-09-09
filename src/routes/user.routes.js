const { Router } = require("express");

const UserController = require("../controller/UserController");
const authenticated = require("../middleware/authenticated");

const userController = new UserController();
const userRoutes = new Router();

userRoutes.post("/", userController.create);
userRoutes.put("/", authenticated, userController.update);

module.exports = userRoutes;