import { asyncHandler } from "../utils/asyncHandler.js";

export const isAuthorized = (role) => {
  return asyncHandler(async(req, res, next) => {
    if (role != req.user.role)
      return next(
        new Error("You are not authorized to do that!", { cause: 403 })
      );
    return next();
  });
};
