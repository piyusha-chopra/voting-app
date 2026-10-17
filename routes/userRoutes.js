const express=require('express');
const router=express.Router();
const User=require('../models/user');
const {jwtAuthMiddleware, generateToken}=require('../jwt');


//Post route for user
router.post('/signup',async (req,res)=>{

    try{

        //extracting user data from request body
        const userData=req.body;

        const adminUser=await User.findOne({role:'admin'});

        if(userData.role==='admin' && adminUser){
            console.log('Admin already exists');
            return res.status(400).json({message:'Admin already exists'});

        }
        //creating User document using mongoose schema
        const newUser=new User(userData);
        
        //save new user to db
        const response=await newUser.save();
        console.log('User saved successfully');

        const payload={
            id:response.id
        }

        const token=generateToken(payload);
        return res.status(200).json({response:response, token:token});

    }catch(err){
        console.log(err);
        return res.status(500).json({err:'Internal server error'});
    }

});

//Login route for user
router.post('/login',async (req,res)=>{

    try{
        
        //extracting user info from request body
        const {aadharCard_num,password}=req.body;
        
        //finding user by aadhar Card number
        const user=await User.findOne({aadharCard_num:aadharCard_num});
        if(!user || !(await user.comparePassword(password))) {
            return res.status(401).json({error:"Invalid aadhar card number or password"});
        }

        //generate token
        const payload={
            id:user.id
        }
        const token=generateToken(payload);

        //return token as response
        return res.json({message:'Login sucessful', token});

    }catch(err){
        console.log(err);
        return res.status(500).json({error:'Internal Server Error'});
    }

});

//Profile route for user
router.get('/profile',jwtAuthMiddleware, async (req,res)=>{

    try{

        //extracting user data from req.user
        const userData=req.user;

        //extracting user id from user data
        const userId=userData.id;

        //finding user by userId
        const user= await User.findById(userId);

        return res.status(200).json({user});

    }catch(err){

        console.log('Profile route error:', err);
        return res.status(500).json({ error: 'Internal server error'});

    }

});

//Change password route for user
router.put('/profile/password',jwtAuthMiddleware,async (req,res)=>{
    try{

        //extracting user data from req.user(token)
        const userId=req.user.id;
        //extracting current and updated password from request body
        const {currentPassword,updatedPassword}=req.body;

        //find user by user id
        const user=await User.findById(userId);

        //if password doesnot match return error
        if(!(await user.comparePassword(currentPassword))){
            return res.status(401).json({err:'Invalid password'});
        }

        //Update the password
        user.password=updatedPassword;
        await user.save();

        return res.status(200).json({message:'Password updated successfully'});
        
    }catch(err){
        console.log(err);
        return res.status(500).json({err:'Internal server error'});
    }
})

module.exports=router;


