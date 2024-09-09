const { hash } = require("bcryptjs");
const knex = require("../database");
const AppError = require("../utils/AppError");

class UserController{
    async create(request, response){
        const { name, email, password, role } = request.body;

        if( !name || !email || !password ){
            throw new AppError("Os campos nome, email e senha devem estar preenchidos!");
        }

        const checkRole = role || "customer";

        const checkIfUserExists = await knex("users").where({email});

        if(checkIfUserExists.length > 0){
            throw new AppError("Email já esta cadastrado");
        }

        const hashedPassword = await hash(password, 8);

        const user = await knex("users").insert({
            name,
            email,
            password: hashedPassword,
            role: checkRole
        })

        return response.status(201).json(user);
    }

    async update(request, response){
        const { email, password, role } = request.body;

        await knex("users").where({email}).update({role});

        return response.status(201).json();
    }
}

module.exports = UserController;