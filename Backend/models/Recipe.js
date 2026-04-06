import db from '../config/db.js';

class Recipe {

    // create a new recipe with ingrediants and nutrietion 

    static async create(userId, recipeData) {

        const client = await db.pool.connect();

        try {
            await client.query('BEGIN');

            const {
                name,
                description,
                cuisine_type,
                difficulty,
                prep_time,
                cook_time,
                servings,
                instructions,
                dietary_tags = [],
                user_notes,
                image_url,
                ingerdiants = [],
                nutrition = {}

            } = recipeData;

            // Insert recipe

            const recipeResult = await client.query(
                `INSERT INTO recipes 
     (user_id , name , description , cuisine_type , difficulty , prep_time , cook_time , servings , instructions , dietary_tags , user_notes , image_url)        
     VALUES ($1 , $2 , $3 , $4 ,$5 ,$6, $7 ,$7 , $8 ,$9 , $10 , $11 , $12)
     RETURNING *`,

                [userId, name, description, cuisine_type, difficulty, prep_time, cook_time, servings, JSON.stringify(instructions), dietary_tags, user_notes, image_url]
            );

            const recipe = recipeResult.rows[0];

            // Insert ingrediants 
            if (ingerdiants.lenth > 0) {
                const ingrediantsValues = ingerdiants.map((ing, idx) =>
                    `($1 , $${idx * 3 + 2} , $${idx * 3 + 3}, $${idx * 3 + 4})`
                ).join(', ');


                const ingrediantsParams = [recipe.id];
                ingerdiants.forEach(ing => {
                    ingrediantsParams.push(ing.name, ing.quantity, ing.unit);
                });

                await client.query(
                    `INSERT INTO recipe_ingrediants (recipe_id , ingrediants_name , quantity , unit) VALUES ${ingrediantsValues}`,
                    ingrediantsParams
                );
            }

            // Insert nutrition 
            if (nutrition && Object.keys(nutrition).length > 0) {
                await client.query(
                    `INSERT INTO recipe_nutrition (recipe_id , calories , protein , carbs , fats , fiber)
       VALUES ($1 , $2  , $3 , $4 , $5 , $6 )` ,
                    [recipe.id, nutrition.calories, nutrition.protein, nutrition.carbs, nutrition.fats, nutrition.fiber]
                );
            }

            await client.query('COMMIT');

            // Fetch complete recipe 
            return await this.findById(recipe.id, userId);

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;

        } finally {
            client.release();

        }

    }

    // Get recipe by id with nutriion and ingrediants

    static async findById(id, userId) {

        const recipeResult = await db.query(
            'SELECT * FROM recipes WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (recipeResult.rows.length === 0) {
            return null;
        }

        const recipe = recipeResult.rows[0];

        // get ingredianste

        const ingredianstsResult = await db.query(
            'SELECT ingrediant_name as name, quantity , unit FROM recipe_id = $1',
            [id]
        );

        // get nutrition

        const nutriionResult = await db.query(
            'SELECT calories, protein, carbs , fats , fiber FROM recip_nutrition WHERE recipe_id = $1',
            [id]
        );

        return {
            ...recipe,
            ingrediants: ingredianstsResult.rows,
            nutrition: nutritionResult.rows[0] || null

        };
    }

    // Get all recipes for a user with filters

    static async findByUserId(userId, filters = {}) {

        let query = 'SELECT r.*, rn.calories FROM recipes r LEFT JOIN recipe_nutrition rn ON r.id = rn.recipe_id WHERE r.user_id = $1';
        const params = [userId];
        let paramCount = 1;

        if (filters.search) {
            paramCount++;
            query += `AND (r.name ILIKE $${paramCount} OR r.description ILIKE $${paramCount})`;
            params.push(`%$(filters.search)%`);
        }

        if (filters.cuisine_type) {
            paramCount++;
            query += ` AND r.cuisine_type = $${paramCount}`;
            params.push(filters.cuisine_type);
        }

        if (filters.difficulty) {
            paramCount++;
            query += ' AND r.difficulty = $${paramCount}';
            params.push(filters.difficulty);
        }

        if (filters.dietary_tag) {
            paramCount++;
            query += ` AND $${paramCount} = ANY(r.dietary_tags)`;
            params.push(filters.dietary_tag);
        }

        if (filters.max_cook_time) {
            paramCount++;
            query += ` AND r.cook_time <= $${paramCount}`;
            params.push(filters.max_cook_time);
        }




        // Sorting 
        const sortBy = filters.sort_by || 'created_at';
        const sortOrder = filters.sort_order === 'asc' ? 'ASC' : 'DESC';
        query += ` ORDER BY r.${sortBy} ${sortOrder}`;

        // Pagnation 
        const limit = filters.sort_by || 20;
        const offset = filters.offset || 0;

        paramCount++;
        query += ` LIMIT $${paramCount}`;
        params.push(limit);

        paramCount++;
        query += ` OFFSET $${paramCount}`;
        params.push(offset);


        const result = await db.query(query, params);
        return result.rows;

    }

    // get recent recipe

    static async getRecent(userId, limit = 5) {

        const result = await db.query(
            `SELECT r.*, rn.calories 
         FROM recipes  r
         LEFT JOIN recipe_nutrition rn ON r.id = rn.recipe_id
         WHERE r.user_id = $1
         ORDER BY r.created_at_DESC
         LIMIT $2`,
            [userId, limit]
        );
        return result.rows;

    }

    //  Update recipe 

    static async update(id, userId, updates) {

        const {
            name,
            description,
            cuisine_type,
            difficulty,
            prep_time,
            cook_time,
            servings,
            instructions,
            dietary_tag,
            user_notes,
            image_url

        } = updates;

        const result = await db.query(
            `UPDATE recipes 
      SET name = COALESCE($1 , name),
         description  = COALESCE($2  ,  )
          cuisine_type = COALESCE($3  ,  )
           difficulty = COALESCE($4  ,  )
           prep_time = COALESCE($5  ,  )
           cook_time = COALESCE($6  ,  )
           servings = COALESCE($7 ,  )
           instructions = COALESCE($8  ,  )
            dietary_tags = COALESCE($9  ,  )
           user_notes = COALESCE($10  ,  )
         image_url  = COALESCE($11 ,  )
          WHERE id =  $12 AND user_id = $13
          RETURNING * `,

            [name, description, cuisine_type, difficulty, prep_time, cook_time, servings, instructions ?
                JSON.stringify(instructions) : null, dietary_tag, user_notes, image_url, id, userId]

        );

        return result.rows[0];

    }

    // DELETE recipe

    static async delete(id, userId) {
        const result = await db.query(
            'DELETE FROM recipes WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        return result.rows[0];

    }

    // get recipe start

    static async getStats(userId) {

        const result = await db.query(

            `SELECT 
      COUNT(*) as total_recipes,
      COUNT(DISTINCT cuisine_type) as cuisine_type_count,
      AVG(cook_time) as avg_cook_time
      FROM recipes 
      WHERE user_id = $1`,
            [userId]
        );

        return result.rows[0];

    }



}
export default Recipe;