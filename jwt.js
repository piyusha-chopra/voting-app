const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req, res, next) => {

    //first check request headers has authorization or not 
    const authorization = req.headers.authorization;
    if (!authorization) return res.status(401).json({ error: 'Token Not Found' });

    //extract the jwt token from request headers
    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        //verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //attach user information to the request object
        req.user = decoded;

        console.log('JWT verified successfully');
        console.log('Decoded user:', decoded);
        next();
    } catch (err) {
        console.log(err);
        res.status(401).json({ error: 'Invalid token' });
    }

}

//Function to generate JWT token
const generateToken = (userData) => {
    //generate a new JWT token using user data
    return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: 30000 });

}

module.exports = { jwtAuthMiddleware, generateToken };