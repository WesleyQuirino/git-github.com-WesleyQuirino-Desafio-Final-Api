const { verify } = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const authConfig = require("../config/auth");

function authenticated (request, reponse, next){
    const authHeader = request.headers.authorization;

    if(!authHeader){
        throw new AppError("Token não informado!", 401);
    }

    const [ , token] = authHeader.split(" ");
    
    try{
        const {role, sub: user_id} = verify(token, authConfig.jwt.secret);

        request.user = {
            id: Number(user_id),
            role
        };

        return next();
    }catch{
        throw new AppError("Ivalid JWT token", 401);
    }
}

module.exports = authenticated;