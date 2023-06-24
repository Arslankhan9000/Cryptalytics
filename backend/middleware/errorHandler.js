const { ValidationError } = require('joi')

const errorHandler = (error, req, res, next) => {
    //  default error 
    let status = 500;
    let data = { message: 'Internal Server error' }

    // If error will be a Validation Error 
    if (error instanceof ValidationError) {
            status = 400,
            data.message = error.message
        return res.status(status).json(data)
    }

    // if in error have status so we replace or update the status code 
    if (error.status) {
        console.log(`Error StatusCode: ${error.status}`)
        // status = error.status
        if (error.status >= 100 && error.status < 600) {
            status = error.status;
        } else {
            status = 401;
        }
    }

    // if in error have message key so we replace or update the message
    if (error.message) {
        console.log(`Error Message: ${error.message}`)
        data.message = error.message;
    }

    return res.status(status).json(data)
}


module.exports = errorHandler