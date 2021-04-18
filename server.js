'use strict';

// application dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');

// enviromental variables
require('dotenv').config();
const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

// application setup
const app = express();
const client = new pg.Client(DATABASE_URL);

// middleware
app.use(express.static('/public'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// set the view engin to ejs
app.set('view engin', 'ejs');

// connect to DB and start the web server
client.connect().then(() => {
    app.listen(PORT, () => {
        console.log('Connected to database: ', client.connectionParameters.database);
        console.log('Server up on port ', PORT);
    });
});

// routes:
// callback functions
// constructor functions