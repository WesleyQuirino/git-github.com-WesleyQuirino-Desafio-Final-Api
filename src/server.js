require("dotenv/config");
require("express-async-errors");
const cors = require("cors");
const AppError = require("./utils/AppError");
const uploadConfig = require("./config/upload");

const express = require("express");
const routes = require("./routes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/files", express.static(uploadConfig.UPLOAD_FOLDER));
app.use(routes);

app.use((error, request, response, next) =>{
    if(error instanceof AppError){
        return response.status(error.statusCode).json({
            message: error.message,
            status: 'error'
        })
    };
    return response.status(500).json({
        status: 'error',
        message: 'Internal server error.'
    });
})

const PORT = 3333;

app.listen(PORT, () => console.log(`O Servidor esta rodando na porta ${PORT}.`));