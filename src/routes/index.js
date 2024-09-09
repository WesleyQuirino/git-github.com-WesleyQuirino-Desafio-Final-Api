const { Router } = require("express");

const userRoutes = require("./user.routes");
const sessionRoutes = require("./session.routes");
const dishRoutes = require("./dish.routes");
const favoriteRoutes = require("./favorite.routes");

const routes = new Router();
routes.use("/users", userRoutes);
routes.use("/sessions", sessionRoutes);
routes.use("/dishes", dishRoutes);
routes.use("/favorite", favoriteRoutes);

module.exports = routes;