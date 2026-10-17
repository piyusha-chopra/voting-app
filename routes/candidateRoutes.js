const express = require('express');
const router = express.Router();
const Candidate = require('../models/candidate');
const User = require('../models/user');
const { jwtAuthMiddleware, generateToken } = require('../jwt');


const checkAdmin = async (userID) => {
    try {
        const user = await User.findById(userID);

        if (!user) {
            return null;
        }

        if(user.role == "admin"){
            return true;
        }

        return false;

    } catch (err) {

        throw err;

    }
}

//Post route to add a candiadte
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {

        const userId = req.user.id;
        //check if the user role is admin or not 
        const isAdmin = await checkAdmin(userId);

        //if user not exists return user not found
        if(isAdmin===null){
            return res.status(404).json({message: "User not found" });
        }

        //if user is not admin deny the access to add a candidate
        if (isAdmin===false) {
            return res.status(403).json({ message: 'Access denied. Admin only' });
        }

        const data = req.body //extracting candidate data from request body

        //create Candidate document using mongoose schema 
        const newCandidate = new Candidate(data);

        //save new candidate to db
        const response = await newCandidate.save();

        console.log('Candidate saved sucessfully');
        return res.status(200).json({ response: response });

    } catch (err) {

        console.log(err);
        return res.status(500).json({ err: 'Internal server error' });

    }
})


//Put route to update a candiadte
router.put('/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try {

        const userId = req.user.id;
        //check if the user role is admin or not 
        const isAdmin = await checkAdmin(userId);

        //if user not exists return user not found
        if(isAdmin===null){
            return res.status(404).json({message: "User not found" });
        }

        //if user is not admin deny the access to update record
        if (isAdmin===false) {
            return res.status(403).json({ message: 'Access denied. Admin only' });
        }

        const candidateID = req.params.candidateId;

        //extracting updated data of candidate from request body
        const upadtedData = req.body;

        //updating candidate data
        const response = await Candidate.findByIdAndUpdate(candidateID, upadtedData, {
            new: true,
            runValidators: true
        });

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate updated sucessfully');
        return res.status(200).json({ response: response });

    } catch (err) {

        console.log(err);
        return res.status(500).json({ err: 'Internal server error' });

    }
})

//Delete route to delete a candiadte
router.delete('/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try {

        const userId = req.user.id;
        //check if the user role is admin or not 
        const isAdmin = await checkAdmin(userId);

        //if user not exists return user not found
        if(isAdmin===null){
            return res.status(404).json({message: "User not found" });
        }
        
        //if user is not admin deny the access to delete record
        if (isAdmin===false) {
            return res.status(403).json({ message: 'Access denied. Admin only' });
        }


        const candidateID = req.params.candidateId;

        const response = await Candidate.findByIdAndDelete(candidateID);

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate record deleted sucessfully');
        return res.status(200).send('Candidate record deleted successfully');

    } catch (err) {

        console.log(err);
        return res.status(500).json({ err: 'Internal server error' });

    }
})

//Voting routes

//route to vote for a candidate
router.post('/vote/:candidateId',jwtAuthMiddleware, async (req, res) => {

    try {

        const candidateID=req.params.candidateId;
        //check if candidate exists
        const candidate= await Candidate.findById(candidateID)
        if(!candidate){
            return res.status(404).json({message: 'Candidate not found'})
        }

        
        const userId = req.user.id;
        //check if user is admin
        //admin cannot vote
        const isAdmin = await checkAdmin(userId);

        //if user not exists return user not found
        if(isAdmin===null){
            return res.status(404).json({message: "User not found" });
        }

        //if user is admin deny the access to vote
        if (isAdmin===true) {
            return res.status(403).json({ message: 'Access denied. Voter only' });
        }

        const user=await User.findById(userId);

        //user can vote only once
        if(user.is_voted){
            return res.status(400).json({message: 'You have already voted'});
        }

        //only user can vote
        //update candidate vote record
        candidate.votes.push({user:userId});
        candidate.voteCount++;
        await candidate.save();

        //update user isvoted
        user.is_voted=true;
        await user.save();

        return res.status(200).json({message:'Voted sucessfully'});
        
    }

    catch (err) {

        console.log(err);
        return res.status(500).json({err:'Internal server error'});
    }

})

//Vote counts

//route to get the list of candidates sorted by their vote counts
router.get('/vote/counts',jwtAuthMiddleware, async(req,res)=>{
    try{

        const response=await Candidate.find().select('name party voteCount -_id').sort({voteCount:'desc'}); 

        return res.status(200).json(response);

    }catch(err){

        console.log(err);
        return res.status(500).json({err:'Internal server error'});
    }
})

//route to get the list of candidates
router.get('/', jwtAuthMiddleware, async (req, res) => {
    try {

        const response = await Candidate.find().select('name party');

        console.log('List of candidates fetched sucessfully');
        return res.status(200).json({ response });

    } catch (err) {

        console.log(err);
        return res.status(500).json({ err: 'Internal server error' });

    }
})



module.exports = router;