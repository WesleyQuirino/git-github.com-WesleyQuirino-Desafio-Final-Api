const knex = require("../database");
const AppError = require("../utils/AppError");

class FavController{
    async create(request, response){
        const user_id = request.user.id;
        const {id} = request.params;
        try {
            await knex("favorites").insert({
                user_id,
                dish_id: id
            })
            return response.status(200).json();
        } catch (error) {
            return response.status(500).json({ error: "Erro ao favoritar!" });
        }
    }
}

module.exports = FavController;