const express = require('express');
const { usersRouter } = require('./routes/users.js');
const { PORT } = require('./config.js');

const app = express();
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

