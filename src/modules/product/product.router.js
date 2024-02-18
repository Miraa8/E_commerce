import { Router } from "express";
import { isAthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/autherization.middileware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as productSchema from "./product.schema.js";
import * as productController from "./product.controller.js";
const router = Router();

//create product
router.post(
  "/",
  isAthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).fields([
    { name: "defaultImage", maxCount: 1 },
    { name: "images", maxCount: 3 },
  ]),
  validation(productSchema.createProduct),
  productController.createProduct
);
//delete product
router.delete(
  "/:id",
  isAthenticated,
  isAuthorized("admin"),
  validation(productSchema.deleteProduct),
  productController.deleteProduct
);
//all products
router.get("/",productController.allProducts);
export default router;
