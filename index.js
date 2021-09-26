const express = require('express');
const { usersRouter } = require('./routes/users.js');
const { PORT } = require('./config.js');

const app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    
    if(req.method === "OPTIONS"){
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, UPDATE, GET");
    }
    next();
});

app.use(express.json());


app.get('/', (req, res) => {
    res.status(200).send("SMAC API HOME");
});

app.post('/', (req, res) => {
    res.status(200).send("SMAC API HOME");
})

app.put('/', (req, res) => {
    res.status(200).send("SMAC API HOME");
})

app.delete('/', (req, res) => {
    res.status(200).send("SMAC API HOME");
})

//routes
app.use('/users', usersRouter);


//Not found
app.use((req, res) => {
    res.status(404).send("Not Found!");
});


app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

