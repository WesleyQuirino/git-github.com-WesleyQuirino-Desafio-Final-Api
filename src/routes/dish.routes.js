const { Router } = require("express");
const multer = require("multer");

const uploadConfig = require("../config/upload");
const DishController = require("../controller/DishController");

const authenticated = require("../middleware/authenticated");
const verifyUserAuthorization = require("../middleware/verifyUserAuthorization");

const dishRoutes = new Router();
const dishController = new DishController();
const upload = multer(uploadConfig.MULTER);

dishRoutes.use(authenticated);

dishRoutes.post("/", authenticated, dishController.create);
dishRoutes.put("/:id", authenticated, dishController.update);
dishRoutes.patch("/dishImage/:id", authenticated, upload.single("dishImage"), dishController.dishImage);
dishRoutes.get("/", authenticated, dishController.index);
dishRoutes.get("/:id", authenticated, dishController.show);
dishRoutes.delete("/:id", authenticated, dishController.delete);

module.exports = dishRoutes;