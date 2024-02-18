import joi from "joi";

//register
export const register =  joi.object({
    userName:joi.string().required().min(3).max(20),
    email:joi.string().email().required(),
    password:joi.string().required(),
    confirmPassword:joi.string().required().valid(joi.ref("password")),

}).required()

//activateAccount 
export const activateAccount = joi.object(
    {
        token:joi.string().required()
    }
).required()

//login
export const login = joi
  .object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  })
  .required();
  // forget code

export const forgetCodeSchema = joi
  .object({
    email: joi.string().email().required(),
  })
  .required();
// reset password

export const resetPasswordSchema = joi
  .object({
    email: joi.string().email().required(),
    forgetCode: joi.string().length(5).required(),
    password: joi
      .string()
      .required()
      .pattern(
        new RegExp(`^.{8,}$`)
      ),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
  })
  .required();
