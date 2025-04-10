const config = require('../config/config');
const swaggerUi = require("swagger-ui-express")
const swaggereJsdoc = require("swagger-jsdoc")

const options = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            version: "1.0.0",
            title: "meca",
            description:
                "meca",
        },
        servers: [
            {

            },
        ],
    },
    apis: ["./routers/*.js",],
}
const specs = swaggereJsdoc(options)

module.exports = { swaggerUi, specs }