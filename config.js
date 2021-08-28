const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    PORT : process.env.PORT,
    GOOGLE_APPLICATION_CREDENTIALS : process.env.GOOGLE_APPLICATION_CREDENTIALS,
    API_KEY : process.env.API_KEY,
    AUTH_DOMAIN : process.env.AUTH_DOMAIN,
    PROJECT_ID : process.env.PROJECT_ID,
    STORAGE_BUCKET : process.env.STORAGE_BUCKET,
    MESSAGING_SENDER_ID : process.env.MESSAGING_SENDER_ID,
    APP_ID : process.env.APP_ID,
    MEASUREMENT_ID : process.env.MEASUREMENT_ID
}