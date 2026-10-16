const mongoose=require('mongoose');
const bcrypt=require('bcrypt');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    email:{
        type:String
    },
    mobile:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        enum:['Male','Female','Other'],
        required:true
    },
    address:{
        type:String,
        required:true
    },
    aadharCard_num:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['voter','admin'],
        default:'voter'
    },
    is_voted:{
        type:Boolean,
        default:false
    },
    password:{
        type:String,
        required:true
    }
});

userSchema.pre('save', async function(){
    const user=this;

    //hash the password only if user password is changed or new
    if(!user.isModified('password')) return;
    try{

        //generate salt
        const salt=await bcrypt.genSalt(10);
        
        //generate hash password
        const  hashedPassword=await bcrypt.hash(user.password,salt);

        //override plain password with hashed password
        user.password=hashedPassword;

    }catch(err){

        throw err;
    }
    
});


//compare password
userSchema.methods.comparePassword=async function(userPassword){
    try{

        const isMatch= await bcrypt.compare(userPassword,this.password);

        return isMatch;

    }catch(err){
        throw err;
    }

}

const User=mongoose.model('User',userSchema);
module.exports=User;