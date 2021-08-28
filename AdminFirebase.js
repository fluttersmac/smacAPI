const admin = require('firebase-admin');
const { GOOGLE_APPLICATION_CREDENTIALS } = require('./config.js');

admin.initializeApp({
    credential: admin.credential.cert(GOOGLE_APPLICATION_CREDENTIALS)
});

module.exports = {
    admin
};