import { Category } from "../../../DB/models/category.model.js";
import {Product} from "../../../DB/models/product.model.js";
import { Subcategory } from "../../../DB/models/subCategory.model.js";
import { Brand } from "../../../DB/models/brand.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import cloudinary from "../../utils/cloud.js";
import randomstring from "randomstring";

//create product controller
export const createProduct = asyncHandler(async (req, res, next) => {
  
  if (!req.files) return next(new Error("product images are required!"));

  const cloudFolder = randomstring.generate({
    length: 5,
  });
  let images = [];
 
   for (const file of req.files.images){
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      { folder: `${process.env.FOLDER_CLOUD_NAME}/products/${cloudFolder}` }
    );
    images.push({id:public_id,url:secure_url});
   }
   
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.defaultImage[0].path,
    { folder: `${process.env.FOLDER_CLOUD_NAME}/products/${cloudFolder}` }
  );
  //create product 
  const product = await Product.create({
    ...req.body,
    cloudFolder,
    createdBy:req.user._id,
    defaultImage:{url:secure_url,id:public_id},
    images
  })
  console.log(product.finalPrice);
  return res.status(201).json({success:true,message:"product created successfuly!",resaults:product})
});
//delete product controller
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if(!product) return next(new Error("product not found"));
  if(product.createdBy.toString()!==  req.user._id.toString())
  return next(new Error("you are not the owner!"));
const ids = product.images.map(image=> image.id);
ids.push(product.defaultImage.id);
await cloudinary.api.delete_resources(ids);
await cloudinary.api.delete_folder(
  `${process.env.FOLDER_CLOUD_NAME}/products/${product.cloudFolder}`
);
await Product.findByIdAndDelete(req.params.id);
return res
  .json({
    success: true,
    message: "product deleted successfuly!",
  });

});


// get all products with search filter sort & paginate

export const allProducts = asyncHandler(async(req,res,next)=>{
  console.log(req.query);
  const {sort,page,keyword,category,brand,subCategory}= req.query;
  if(category && !(await Category.findById(category)))
  return next(new Error("category not found!"));
  if(brand && !(await Brand.findById(brand)))
  return next(new Error("brand not found!"));
  if(subCategory && !(await Subcategory.findById(subCategory)))
  return next(new Error("subCategory not found!"));
  const products = await Product.find({...req.query}).sort(sort).search(keyword).paginate(page);
  return res.json({success:true,resaults:products});
})