import { Router } from "express";
import { validation } from "../../middleware/validation.middleware.js";
import * as authController from "./auth.controller.js";
import * as authSchema from "./auth.schema.js";

const router = Router();

// register
router.post(
  "/register",
  validation(authSchema.register),
  authController.register
);
//activate account
router.get(
  "/activate_account/:token",
  validation(authSchema.activateAccount),
  authController.activateAccount
);
//login
router.post("/login",validation(authSchema.login), authController.login);
// send forget code
router.patch(
  "/forget_code",
  validation(authSchema.forgetCodeSchema),
  authController.sendForgetCode
);

//reset password
router.patch(
  "/reset_password",
  validation(authSchema.resetPasswordSchema),
  authController.resetPassword
);

export default router;
