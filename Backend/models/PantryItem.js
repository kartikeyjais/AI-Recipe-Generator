import db from '../config/db.js';

class PantryItem {

    // Create a new pantry Item

 static async create(userId , itemData){
     
    const {name , quantity , unit , category , expiry_date , is_running_low} =  itemData;

   const result = await db.query(
    
     `INSERT INTO pantry_items 
      (user_id , name , quantity , unit , category , expiry_date , is_running_low)
      VALUES ($1 , $2 , $3 , $4 , $5 , $6 , $7)
      RETURNING *`,
      [userId , name , quantity , unit , category , expiry_date , is_running_low]
   ); 
    
   return result.rows[0]; 

 }   

//  get all the pantry items for user

static async findByUserId(userId , filters = {}){

    let query = `SELECT * FROM pantry_items WHERE user_id = $1`;
    const params = [userId];
    let paramCount = 1;

    if(filters.category){
        paramCount++;
        query += `AND category = $${paramCount}`;
        param.push(filters.category);  
    }

    if(filters.is_running_low !== undefined){
       paramCount++;
       query += `AND is_running_row = $${paramCount}`;
       params.push(filters.is_running_low);
    }
   
   if(filters.search){
      paramCount++;
      query += `AND name ILIKE $${paramCount}`;
      params.push(`%${filters.search}%`); 
   }
   
   query += ' ORDER BY created_at DESC';

   const result = await db.query(query , params);
   return result.rows;   

 }

//  get items expiring soom (within next 7 days)
 
 static async getExpiringSoon(userId , days = 7){
    const result = await db.query(
      `SELECT * FROM pantry_items
     WHERE user_id = $1
     AND expiry_date IS NOT NULL
     AND expiry_date <= CURRENT_DATE + INTERVAL '${days} days'
     AND expiry_date >= CURRENT_DATE 
     ORDER BY expiry_date ASC`,
     [userId]
    );

     return result.rows;
   }

//  Get pantry items by id

 static async findByUserId(id, userId) {
     
     const result = await db.query(
         'SECECT * FROM pantry_items WHERE id = $1 AND user_id = $2',
         [id , userId]
     );
   return result.rows[0];

 }

// update pantry item 
static async update(id , userId , updates){
    const {name , quantity , unit , category , expiry_date , is_running_low } = updates;

    const result = await db.query(
     `UPDATE pantry_items 
    SET name = COALESCE($1 , name),
    qunatity = COALESCE($2 , quantity),
    unit  = COALESCE($3 , unit),
    category = COALESCE($4 , category),
    expiry_date = COALESCE($5 , expiry_date),
    is_running_low = COALESCE($6 , is_running_low)
   WHERE id = $7 AND user_id = $8
   RETURNING *`

  [name , quantity , unit , category , category , expiry_date , is_running_low , id , userId]

    );

    return result.rows[0]; 
    
} 

// DELETE PANTRY ITEMS  

static async delete(id ,user_id){ 
  const result = await db.query( 
    'DELETE FROM pantry_items WHERE id = $1 AND user_id = $2 RETURNING *', 
    [id , userId] 

  );

  return result.rows[0]; 
  } 

//  Get pantry starts 

static async getStats(userId) {
    const result = await db.query(
        `SELECT 
        COUNT(*) as total_items 
        COUNT(DISTINCT category) as total_categories,
        COUNT(*) FILTER (WHERE is running_low = true) as running_low_count,
        COUNT(*) FILTER (WHERE expiry_date <= CURRENT_DATE + INTERVEL '7 days' AND expiry_date >= CURRENT_DATE) as expiring_soon_count
      FROM pantry_items
      WHERE user_id = $1`,
         [userId]          
    );

   return result.rows[0];
  }
 }

export default PantryItem;

