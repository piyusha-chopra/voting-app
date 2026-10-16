const express=require('express');
const app=express();
const db=require('./db');
require('dotenv').config();


app.use(express.json());

app.get('/',(req,res)=>{
    res.send('Welcome to Voting Application');
})

//import router files
const userRoutes=require('./routes/userRoutes');

//use the routes
app.use('/user',userRoutes);

const PORT=process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log("Server is listening on PORT 3000");
})