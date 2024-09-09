const { compare } = require("bcryptjs");
const knex = require("../database");
const AppError = require("../utils/AppError");
const AuthConfig = require("../config/auth");
const { sign } = require("jsonwebtoken");

class SessionController{
    async signIn(request, response) {
        const { email, password } = request.body;

        if(!email || !password){
            throw new AppError("Os campos nome, email e senha devem estar preenchidos!");
        }
        
        const user = await knex("users").where({email}).first();

        const checkPassword = await compare(password, user.password);

        if(!checkPassword){
            throw new AppError("E-mail e/ou senha incorreto!");
        }
        
        const {secret, expiresIn} = AuthConfig.jwt;
        const token = sign({ role: user.role }, secret, {
            subject: String(user.id),
            expiresIn
        });

        return response.status(201).json({user, token});
    }
}

module.exports = SessionController;