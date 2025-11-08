import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema =new mongoose.Schema({
    userName:{
        type:String,
        required:true,
        unique:true
      },
      email:{
          type:String,
          required:true,
          unique:true
      },
      password:{
          type:String,
          required:true,
          minlength:8
      },
      profileImage:{
          type:String,
          default:""
      }
},{timestamps:true})

//hash password before saving user to database
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    const salt=await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)
    next()
})
const User =mongoose.model("User",userSchema);

export default User;