const express  = require('express');
const databaseConnection = require('./database/index')
const {PORT_ENV} = require('./config/index')
const router = require('./routes/index')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
// const PORT = 5000

const app = express();

app.use(cookieParser());

// allow to communncate with json data that user pass in body  
// i.e except or send data in json 
app.use(express.json())

// app.use(bodyParser.json()) // for parsing application/json?
// app.use(bodyParser.urlencoded({ extended: true }))


app.use(router)

databaseConnection();

// A middleware to access this img url in browser get 
// http://localhost:5000/storage/1687278483967_63e3930ef2875cb6fd7a0862.png
app.use("/storage",express.static('storage'))

// register a custom middleware ==================
app.use(errorHandler)



// app.get('/test',(req,res)=>{
//     res.json({
//         message:"Hello test"
//     })
// })

app.listen(PORT_ENV,()=>{
    console.log(`App listen on port ${PORT_ENV}`)
})






// https://www.w3docs.com/keyboard