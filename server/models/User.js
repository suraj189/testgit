const mongoose=require('mongoose')
const {Schema} =mongoose

const userSchema= new Schema({
    name: String,
    email:{type:String,unique:true},
    password:String
})

//test commit 
const UserModel = mongoose.model('Users',userSchema)

module.exports=UserModel;