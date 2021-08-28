const express = require('express');
const usersRouter = express.Router();
const { client } = require('../ClientFirebase');
const { admin } = require('../AdminFirebase');

// list all users
usersRouter.get('/', (req, res) => {
    var userList = [];
    const listAllUsers = (nextPageToken, userList) => {
        admin
        .auth()
        .listUsers(1000, nextPageToken)
        .then((listUsersResult) => {
            userList.push(listUsersResult);
            if (listUsersResult.pageToken) {
                listAllUsers(listUsersResult.pageToken, userList);
            }
            else{
                res.status(201).send(userList);
            }
        })
        .catch((error) => {
            res.status(500).send(error.message);
        });
    };
    listAllUsers(undefined, userList);
});

// get user by uid
usersRouter.get('/id/:id', (req, res) => {
    const userId = req.params.id;
    admin.auth().getUser(userId)
    .then((userRecord) => {
        res.status(201).send(userRecord);
    })
    .catch((error) => {
        res.status(500).send(error.message);
    })
});

//get user by email
usersRouter.get('/email/:email', (req, res) => {
    const userEmail = req.params.email;
    admin
    .auth()
    .getUserByEmail(userEmail)
    .then((userRecord) => {
        res.status(201).send(userRecord);
    })
    .catch((error) => {
        res.status(500).send(error.message);
    });
});

// get user by phoneNumber
usersRouter.get('/phoneNumber/:phoneNumber', (req, res) => {
    const userPhoneNumber = req.params.phoneNumber;
    admin
    .auth()
    .getUserByPhoneNumber(userPhoneNumber)
    .then((userRecord) => {
        res.status(201).send(userRecord);
    })
    .catch((error) => {
        res.status(500).send(error.message);
    });
});

// create a new user
usersRouter.post('/', (req, res) => {
    const userId = req.body.uid;
    const userEmail = req.body.email;
    const userEmailVerified = req.body.emailVerified;
    const userPhoneNumber = req.body.phoneNumber;
    const userPassword = req.body.password;
    const userDisplayName = req.body.displayName;
    const userPhotoURL = req.body.photoURL;
    const userDisabled = req.body.disabled;
    const userRole = req.body.role;

    admin.auth().createUser({
        uid: userId,
        email: userEmail,
        emailVerified: userEmailVerified,
        phoneNumber: userPhoneNumber,
        password: userPassword,
        displayName: userDisplayName,
        photoURL: userPhotoURL,
        disabled: userDisabled
    })
    .then((userRecord) => {
        admin.auth().setCustomUserClaims(userRecord.uid, {
            role: userRole
        })
        .then(() => {
            res.status(201).send(userRecord);
        })
        .catch((error) => {
            res.status(500).send(error.message);
        });
        
    })
    .catch((error) => {
        res.status(500).send(error.message);
    });
});

module.exports = {
    usersRouter
}