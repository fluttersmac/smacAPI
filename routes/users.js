const express = require('express');
const usersRouter = express.Router();
const { admin, db } = require('../AdminFirebase');

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

// function create user in db
const createUser = async (userRecord, userPhoneNumber=null, userPassword=null, userRole=null) => {
    var userDocRef = db.collection('users').doc(userRecord.uid);
    let userData = {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        phoneNumber: userPhoneNumber,
        disabled: userRecord.disabled,
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime,
        lastRefreshTime: userRecord.metadata.lastRefreshTime,
        role: userRole,
    }
    if(userData.uid === null || userData.uid === undefined){
        console.log("user id should not be empty");
        return;
    }
    if(userData.email === null || userData.email === undefined){
        console.log("email should not be empty");
        return;
    }
    if(userPassword === null || userPassword === undefined){
        console.log("password should not be empty");
        return;
    }
    if(userData.emailVerified === undefined){
        userData.emailVerified = false;
    }
    if(userData.displayName === undefined){
        userData.displayName = "Anonymous User";
    }
    if(userData.photoURL === undefined){
        userData.photoURL = null;
    }
    if(userData.phoneNumber === undefined){
        userData.phoneNumber = null;
    }
    if(userData.disabled === undefined){
        userData.disabled = false;
    }
    if(userData.creationTime === undefined){
        userData.creationTime = null;
    }
    if(userData.lastSignInTime === undefined){
        userData.lastSignInTime = null;
    }
    if(userData.lastRefreshTime === undefined){
        userData.lastRefreshTime = null;
    }
    let response = await userDocRef.set(userData);
    console.log(response);
}

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

    let userData = {
        uid: userId,
        email: userEmail,
        emailVerified: userEmailVerified,
        password: userPassword,
        displayName: userDisplayName,
        disabled: userDisabled
    }

    if(userPhotoURL !== null && userPhotoURL !== undefined && userPhotoURL !== ''){
        userData.photoURL = userPhotoURL;
    }

    admin.auth().createUser(userData)
    .then((userRecord) => {
        admin.auth().setCustomUserClaims(userRecord.uid, {
            role: userRole
        })
        .then(() => {
            createUser(userRecord, userPhoneNumber, userPassword, userRole);
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

//function delete user from db
const deleteUser = async (userId) => {
    const res = await db.collection('users').doc(userId).delete();
    console.log(res);
}

//delete user
usersRouter.delete('/:uid', (req, res) => {
    const userId = req.params.uid;
    admin
    .auth()
    .deleteUser(userId)
    .then(() => {
        deleteUser(userId);
        res.status(200).send("User deleted successfully!");
    })
    .catch((error) => {
        res.status(500).send(error);
    });
});

//function update user in db
const updateUser = async (userId, userData) => {
    let response = await db.collection('users').doc(userId).update(userData);
    console.log(response);
}

//update user
usersRouter.put('/:uid', (req, res) => {
    const userId = req.params.uid;
    const userData = req.body;
    let userUpdateData = {
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        emailVerified: userData.emailVerified,
        password: userData.password,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        disabled: userData.disabled,
    };
    admin
    .auth()
    .updateUser(userId, userUpdateData)
    .then((userRecord) => {
        updateUser(userId, userUpdateData);
        res.status(201).send(userRecord);
    })
    .catch((error) => {
        res.status(500).send(error);
    });
});

//function update username
const updateDisplayName = async (userId, userData) => {
    if(userData.displayName === undefined || userId === null){
        console.log("displayName is not updated!");
        return;
    }
    let response = await db.collection('users').doc(userId).update(userData);
    console.log(response);
}

//update Display Name
usersRouter.put('/displayName/:uid', (req, res) => {
    const userId = req.params.uid;
    const userDisplayName = req.body.displayName;
    admin
    .auth()
    .updateUser(userId, {
        displayName: userDisplayName,
    })
    .then((userRecord) => {
        updateDisplayName( userId, { displayName: userDisplayName });
        res.status(201).send(userRecord);
    })
    .catch((error) => {
        res.status(500).send(error);
    });
});

//function updateEmail
const updateEmail = async (userId, userData) => {
    if(userData.email === undefined || userId === null){
        console.log("email is not updated!");
        return;
    }
    let response = await db.collection('users').doc(userId).update(userData);
    console.log(response);
}

//update user email
usersRouter.put('/email/:uid', (req, res) => {
    const userId = req.params.uid;
    const userEmail = req.body.email;
    admin
    .auth()
    .updateUser(userId, {
        email: userEmail,
    })
    .then((userRecord) => {
        updateEmail( userId, { email: userEmail });
        res.status(201).send(userRecord);
    })
    .catch((error) => {
        res.status(500).send(error);
    });
});

//function update phone number
const updatePhoneNumber = async (userId, userData) => {
    if(userData.phoneNumber === undefined || userId === null){
        console.log("phone number not updated!");
        return;
    }
    let response = await db.collection('users').doc(userId).update(userData);
    console.log(response);
}

//update phoneNumber
usersRouter.put('/phoneNumber/:uid', (req, res) => {
    const userId = req.params.uid;
    const userPhoneNumber = req.body.phoneNumber;
    admin
    .auth()
    .updateUser(userId, {
        phoneNumber: userPhoneNumber,
    })
    .then((userRecord) => {
        updatePhoneNumber( userId, { phoneNumber: userPhoneNumber });
        res.status(201).send(userRecord);
    })
    .catch((error) => {
        res.status(500).send(error);
    });
});

//function update password
const updatePassword = async (userId, userData) => {
    if(userData.password === undefined || userId === null){
        console.log("password not updated!");
        return;
    }
    let response = await db.collection('users').doc(userId).update(userData);
    console.log(response);
}

//update password
usersRouter.put('/password/:uid', (req, res) => {
    const userId = req.params.uid;
    const userPassword = req.body.password;
    admin
    .auth()
    .updateUser(userId, {
        password: userPassword,
    })
    .then((userRecord) => {
        updatePassword(userId, { password: userPassword });
        res.status(201).send(userRecord);
    })
    .catch((error) => {
        res.status(500).send(error);
    });
});

//function update photoURL
const updatePhotoURL = async (userId, userData) => {
    if(userData.photoURL === undefined || userId === null){
        console.log("photo URL not updated!");
        return;
    }
    let response = await db.collection('users').doc(userId).update(userData);
    console.log(response);
}

//update photoURL
usersRouter.put('/photoURL/:uid', (req, res) => {
    const userId = req.params.uid;
    const userPhotoURL = req.body.photoURL;
    admin
    .auth()
    .updateUser(userId, {
        photoURL: userPhotoURL,
    })
    .then((userRecord) => {
        updatePhotoURL(userId, { photoURL: userPhotoURL });
        res.status(201).send(userRecord);
    })
    .catch((error) => {
        res.status(500).send(error);
    });
});

//function emailVerified
const updateEmailVerified = async (userId, userData) => {
    if(userData.emailVerified === undefined || userId === null){
        console.log("emailVerified not updated!");
        return;
    }
    let response = await db.collection('users').doc(userId).update(userData);
    console.log(response);
}

//update emailVerified
usersRouter.put('/emailVerified/:uid', (req, res) => {
    const userId = req.params.uid;
    const userEmailVerified = req.body.emailVerified;
    admin
    .auth()
    .updateUser(userId, {
        emailVerified: userEmailVerified,
    })
    .then((userRecord) => {
        updateEmailVerified(userId, { emailVerified: userEmailVerified });
        res.status(201).send(userRecord);
    })
    .catch((error) => {
        res.status(500).send(error);
    });
});

//function update diabled
const updateDisabled = async (userId, userData) => {
    if(userData.disabled === undefined || userId === null){
        console.log("disabled is not updated!");
        return;
    }
    let response = await db.collection('users').doc(userId).update(userData);
    console.log(response);
}

//update disabled
usersRouter.put('/disabled/:uid', (req, res) => {
    const userId = req.params.uid;
    const userDisabled = req.body.disabled;
    admin
    .auth()
    .updateUser(userId, {
        disabled: userDisabled,
    })
    .then((userRecord) => {
        updateDisabled(userId, { disabled: userDisabled });
        res.status(201).send(userRecord);
    })
    .catch((error) => {
        res.status(500).send(error);
    });
});

//function update user role
const updateRole = async (userId, userData) => {
    if(userData.role === null || userId === null){
        console.log("role is not updated");
        return;
    }
    let response = await db.collection('users').doc(userId).update(userData);
    console.log(response);
}

//update user role
usersRouter.put('/role/:uid', (req, res) => {
    const userId = req.params.uid;
    const userRole = req.body.role;
    admin.auth().setCustomUserClaims(userId, {
        role: userRole
    })
    .then((userRecord) => {
        updateRole(userId, { role: userRole });
        res.status(201).send(userRecord);
    })
    .catch((error) => {
        res.status(500).send(error.message);
    });
});




module.exports = {
    usersRouter
}