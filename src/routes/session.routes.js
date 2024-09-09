const { Router } = require("express");
const SessionController = require("../controller/SessionController");

const sessionController = new SessionController();
const sessionRoutes = new Router();

sessionRoutes.post("/", sessionController.signIn);

module.exports = sessionRoutes;