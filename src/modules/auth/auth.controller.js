import { User } from "../../../DB/models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../utils/sendEmails.js";
import { signUpTemp } from "../../utils/htmlTemplates.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Token } from "../../../DB/models/token.model.js";
import randomstring from "randomstring";
import { Cart } from "../../../DB/models/cart.model.js";

//register 
export const register = asyncHandler( async(req,res,next)=>{
const{email}= req.body;
const user = await User.findOne({email});
if(user)
return next(new Error("email already exists"),{cause:409});

 const token = jwt.sign(email,process.env.TOKEN_SECRET);
 await User.create({...req.body});
 const confirmatinLink = `http://localhost:3000/auth/activate_account/${token}`;
 const sentMessage = await sendEmail({to:email, subject:"activate account",html:signUpTemp(confirmatinLink)})
 if(!sentMessage)
 return next(new Error("something went wrong "));
 return res.status(201).json({success:true,message:"check your email!"})
});

//activate account
export const activateAccount = asyncHandler(async(req,res,next)=>{
const {token} = req.params;
const email = jwt.verify(token,process.env.TOKEN_SECRET);
const user = await User.findOneAndUpdate({email},{isConfirmed:true});
if(!user) return next(new Error("user not found "),{cause:404})
//create cart 
await Cart.create({user:user._id});
return res.json({success:true , message:"you can login now"})

})
//login
export const login = asyncHandler( async(req,res,next)=>{
const{email,password}= req.body;
const user = await User.findOne({email});
if(!user)
return next(new Error("user not found"),{cause:404});
if(!user.isConfirmed)
return next(new Error("you must activate your account first "));
const match = bcryptjs.compareSync(password,user.password);
if(!match) return next(new Error("incorrect password"));  
 const token = jwt.sign(email,process.env.TOKEN_SECRET);
 await Token.create({ token ,user:user._id});
 return res.status(201).json({success:true,resaults:{token}});
 
});
//////////////////////forget code//////////////////////

export const sendForgetCode =asyncHandler( async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new Error("user not found"));
  if (!user.isConfirmed)
    return next(new Error("you must activate your account first!"));
  const code = randomstring.generate({
    length: 5,
    charset: "numeric",
  });
  user.forgetCode = code;
  await user.save();
  const messageSent = sendEmail({
    to: user.email,
    subject: "forget password code",
    html: `<div>${code}</div>`,
  });
  if (!messageSent) return next(new Error("email invalid!"));
  return res.send("you can reset password now check email");
})
//////////////////////reset password//////////////////////

export const resetPassword = asyncHandler( async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new Error("email doesn't exist", { cause: 404 }));
  if (user.forgetCode != req.body.forgetCode) {
    console.log(user.forgetCode , req.body.forgetCode);
    return next(new Error("invalid code!"));
  }

  user.password = req.body.password;
  await user.save();
  // invalidate all tokens
  const tokens = await Token.find({ user: user._id });
  tokens.forEach(async (token) => {
    token.isValid = false;
    await token.save();
  });
await User.findOneAndUpdate(
  { email: req.body.email },
  { $unset: { forgetCode: 1 } }
);
  return res.json({ success: true, message: "you can login now" });
});