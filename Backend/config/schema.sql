
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table 
CREATE TABLE IF NOT EXISTS users (
    
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL, 
  password_hash VARCHAR(255) NOT NULL, 
  name VARCHAR(255) NOT NULL, 
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, 
  dietary_restrictions TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  preferred_cuisines TEXT[] DEFAULT '{}',
  default_servings INT DEFAULT 4, 
  measurement_unit VARCHAR(20) DEFAULT 'metric',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  UNIQUE(user_id) 
  
);

-- Pantry Irtems Table

CREATE TABLE IF NOT EXISTS pantry_items (
 
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID REFERENCES users(id) ON DELETE CASCADE,
name VARCHAR(255) NOT NULL, 
quantity DECIMAL(10, 2) NOT NULL, 
unit VARCHAR(50) NOT NULL, 
category VARCHAR(100) NOT NULL, 
expiry_date DATE, 
is_running_low BOOLEAN DEFAULT FALSE, 
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 

);

--Recipes Table 
CREATE TABLE IF NOT EXISTS recipes (
  
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
 user_id UUID REFERENCES users(id) ON DELETE CASCADE,
 name VARCHAR(255) NOT NULL, 
 description TEXT,
 cuisine_type VARCHAR(100),
 difficulty VARCHAR (20) DEFAULT 'medium', 
 prep_time INT, 
 cook_time INT,
 servings INT DEFAULT 4,
 instructions JSONB NOT NULL,
 dietary_tags TEXT[] DEFAULT '{}',
 user_notes TEXT,
 image_url TEXT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP   
);

-- recipe ingrediant table 
CREATE TABLE IF NOT EXISTS recipe_ingredients (

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE, 
  ingredient_name VARCHAR (255) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL, 
  unit VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  
);

-- Recipe Nutrietions Table
 
 CREATE TABLE IF NOT EXISTS recipe_nutrition (
 
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
 recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE, 
 calories INT, 
 protein DECIMAL (10, 2), 
 carbs DECIMAL (10, 2),
 fats DECIMAL (10, 2), 
 fiber DECIMAL (10, 2),
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 UNIQUE (recipe_id)  
 
 );

-- MEAL plans Table 

CREATE TABLE IF NOT EXISTS meal_plans (
  
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 user_id UUID REFERENCES users (id) ON DELETE CASCADE, 
 recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE, 
 meal_date DATE NOT NULL,
 meal_type VARCHAR (20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')), 
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
 UNIQUE (user_id, meal_date, meal_type) 

);

-- shopping list items Table 
CREATE TABLE IF NOT EXISTS shopping_list_items (
   
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ingredient_name VARCHAR(255) NOT NULL, 
    quantity DECIMAL(10, 2) NOT NULL, 
    unit VARCHAR(50) NOT NULL, 
    category VARCHAR(50) NOT NULL,
    is_checked BOOLEAN DEFAULT FALSE,
    from_meal_plan BOOLEAN DEFAULT FALSE, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     
); 

-- this index ,make our query much faster 
-- Created index for better query perfomance 

CREATE INDEX IF NOT EXISTS idx_pantry_user_id ON pantry_items(user_id);
CREATE INDEX IF NOT EXISTS idx_pantry_category ON pantry_items(category);
CREATE INDEX IF NOT EXISTS idx_pantry_expiry ON pantry_items(expiry_date);

CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine ON recipes(cuisine_type);

CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON meal_plans(user_id, meal_date);

CREATE INDEX IF NOT EXISTS idx_shopping_list_user ON shopping_list_items (user_id);

--Function to update updated updated_at timestamp

CREATE OR REPLACE FUNCTION update_updated_at_column() 
RETURNS TRIGGER AS $$  
BEGIN  
     NEW.updated_at = CURRENT_TIMESTAMP; 
     RETURN NEW; 
END; 
$$ language 'plpgsql'; 

-- create triggers for upfated at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_pantry_items_updated_at BEFORE UPDATE ON pantry_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();        

CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON meal_plans
   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   
CREATE TRIGGER update_shopping_list_items_updated_at BEFORE UPDATE ON shopping_list_items
   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   
      