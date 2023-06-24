const dotenv = require('dotenv').config()

const PORT_ENV = process.env.PORT

const connectionString_ENV  = process.env.MONGO_DB_CONNECTION_STRING

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET + ""
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET + ""

const base_url = process.env.BASE_URL


module.exports = {
    PORT_ENV,
    connectionString_ENV,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    base_url
}