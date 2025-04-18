const dotenv = require("dotenv");
const express = require('express');
dotenv.config({path:"./config.env"});
const path = require('path');
const app = express();

app.use('/assets/images', express.static(path.join(__dirname, './assets/images')));

app.use(require('./router/auth'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running at port number ${PORT}`);
});