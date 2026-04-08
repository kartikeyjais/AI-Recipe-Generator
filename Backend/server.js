import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
// import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import pantryRoutes from './routes/pantry.js';
import recipeRoutes from './routes/recipes.js';
import mealPlanRoutes from './routes/mealPlans.js';
import shoopingListRoutes from './routes/shoopingList.js';

const app = express();

// Middlewares
  
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// test route
app.get('/' , (req , res)=>{
  res.json({message: 'AI Recipe Generator API'});   
})

// API routes
 app.use('/api/auth' , authRoutes);
 app.use('/api/users' , userRoutes);
 app.use('/api/pantry' , pantryRoutes);
 app.use('/api/recipes' , recipeRoutes);
 app.use('/api/meal-plans' , mealPlanRoutes);
 app.use('/api/shooping/-list' , shoopingListRoutes);
 

const PORT = process.env.PORT || 8000;

app.listen(PORT , ()=>{
   console.log(`Server running on port ${PORT}`);
   console.log(`Environment: ${process.env.NODE_ENV ||'development'}`); 
});