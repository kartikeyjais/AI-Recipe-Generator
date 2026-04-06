// import jwt from 'jsonwebtoken';

// const authMiddleware = async (req , res , next) => {
 
//   try{
     
//     //get token for the header
//     const token = req.header('Authorization')?.replace ('Bearer' , '');
// if (!token){
// return res. status(401).json({
// success: false,
// message: 'No authentication token, access denied'
//    });
//  }
  
// // Verify token
// const decoded = jwt.verify(token, process.env.JWT_SECRET);

// //Add user info to request 
//   req.user = {
//     id: decoded.id, 
//     email: decoded.email 

//   };

//     next();

//   }
//     catch (error) {

//     console.error('Auth middleware error:', error);
//     res.status (401).json({ 
//     success: false, 
//     message: 'Token is not valid'

//    });
    
//     }
//   }

// export default authMiddleware;

import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    const token =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token, access denied',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Token is not valid',
    });
  }
};

export default authMiddleware;