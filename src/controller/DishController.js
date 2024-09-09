const knex = require("../database");
const AppError = require("../utils/AppError");
const DiskStorage = require("../provider/DiskStorage");

class DishController{
    async create(request, response){
        const { name, description, value, category_id, ingredients } = request.body;
        const user_id = request.user.id;
        
        if( !name || !description || !value ){
            throw new AppError("Os campos nome, descrição e valor devem estar preenchidos!");
        };
        
        const valueFixed = Number(value).toFixed(2);

        const [id] = await knex("dishes").insert({
            name, 
            description,
            value: valueFixed,
            category_id,
            user_id
        });

        if (ingredients.length > 0) {
            const ingredientsInsert = ingredients.map(name => ({
                name,
                dish_id: id
            }));
            await knex("ingredients").insert(ingredientsInsert);
        }
        try {
            const dish = await knex("dishes").where({id}).first();

            if (!dish) {
                throw new AppError("Algo deu errado!", 400);
            };

            const ingredients = await knex("ingredients").where("dish_id", id).select("name");
            
            return response.json({
                ...dish,
                ingredients: ingredients.map(ingredient => ingredient.name)
            });
        } catch (error) {
            return response.status(500).json({ error: "Erro ao buscar prato e ingredientes" });
        }
    }

    async index(request, response) {
        const user_id = request.user.id;

        try {
            const dishes = await knex("dishes");
            const completeDishes = await Promise.all(dishes.map(async (dish) => {
                const ingredients = await knex("ingredients").select("name").where("dish_id", dish.id);
                const favorite = await knex("favorites").where("dish_id", dish.id).where({user_id}).first();
                return {
                    ...dish,
                    ingredients: ingredients.map(ingredient => ingredient.name),
                    favorite: !!favorite
                };
            }));
            return response.status(200).json(completeDishes);
        } catch (error) {
            console.error("Erro ao buscar pratos com favoritos:", error);
            return response.status(500).json({ error: "Erro ao buscar pratos com favoritos" });
        }
    }

    async show(request, response){
        const user_id = request.user.id;
        const {id} = request.params;

        try {
            const dish = await knex("dishes").where({id}).first();
            if (!dish) {
                throw new AppError("Prato não encontrato!", 400);
            };
            const ingredients = await knex("ingredients").where("dish_id", id).select("name");
            const favorite = await knex("favorites").where("dish_id", dish.id).where({user_id}).first();
            return response.status(200).json({
                ...dish,
                favorite: !!favorite,
                ingredients: ingredients.map(ingredient => ingredient.name)
            });
        } catch (error) {
            return response.status(500).json({ error: "Erro ao buscar prato e ingredientes" });
        }
    }

    async update(request, response){
        const { name, description, value, category_id, ingredients} = request.body;
        
        const {id} = request.params;
        const user_id = request.user.id;
        
        const dish = await knex("dishes").where({id}).where({user_id}).first();

        if(!dish){
            throw new AppError("Apenas o criador do prato pode altera-lo!", 401);
        };

        dish.name = name || dish.name;
        dish.description = description || dish.description;
        if (value !== undefined && value !== null && value !== '') {
            dish.value = Number(value).toFixed(2);
        } else {
            dish.value = dish.value;  // Mantém o valor original
        }
        dish.category_id = category_id || dish.category_id;
        
        await knex("dishes").where({id}).update({
            name: dish.name,
            description: dish.description,
            value: dish.value,
            category_id: dish.category_id,
            updated_at: knex.fn.now()
        });

        const dish_id = id;

        try {
            const existingIngredients = await knex("ingredients").where({dish_id});
            const existingNames = existingIngredients.map(ingredient => ingredient.name);
            const ingredientsToRemove = existingNames.filter(name => !ingredients.includes(name));
            const ingredientsToAdd = ingredients.filter(name => !existingNames.includes(name));

            if (ingredientsToRemove.length > 0) {
                await knex("ingredients").where({ dish_id }).whereIn('name', ingredientsToRemove).del();
            }

            if (ingredientsToAdd.length > 0) {
                const ingredientsInsert = ingredientsToAdd.map(name => ({
                    name,
                    dish_id
                }));
        
                await knex("ingredients").insert(ingredientsInsert);
            };
        
            return response.json(dish);
        } catch (error) {
            return response.status(500).json({ error: "Erro ao inserir ingredientes" });
        }
    }
    
    async dishImage(request, response){
        const user_id = request.user.id;
        const dishFileName = request.file.filename;
        const {id} = request.params;
        const diskStorage = new DiskStorage();
        
        const dish = await knex("dishes").where({id}).where({user_id}).first();

        if(!dish){
            throw new AppError("Apenas o criador do prato pode altera-lo!", 401);
        }

        if(dish.img){
            diskStorage.deleteFile(dish.img);
        }

        const fileName = await diskStorage.saveFile(dishFileName);
        dish.img = fileName;

        await knex("dishes").where({id}).update({
            img: fileName
        });

        return response.status(201).json(dish);
    }

    async delete(request, response){
        const user_id = request.user.id;
        const {id} = request.params;
        const diskStorage = new DiskStorage();

        const dish = await knex("dishes").where({id}).where({user_id}).first();

        if(!dish){
            throw new AppError("Apenas o criador do prato pode exclui-lo!", 401);
        };
        
        if(dish.img){
            diskStorage.deleteFile(dish.img);
        };

        await knex("dishes").where({id}).where({user_id}).delete();

        return response.status(201).json("Prato excluido com sucesso!");
    }
}

module.exports = DishController;