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
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public/styles'));

// set the view engin to ejs
app.set('view engine', 'ejs');

// connect to DB and start the web server
client.connect().then(() => {
    app.listen(PORT, () => {
        console.log('Connected to database: ', client.connectionParameters.database);
        console.log('Server up on port ', PORT);
    });
});

// routes:
app.get('/home', showAllCharacters);
app.get('/character/create', renderCreatePage);
app.get('/character/my-characters', showAllCreatedCharacters);
app.get('/character/my-fav-characters', showAllFavorites);
app.get('/character/:id', viewDetails);
app.post('/favorite-character', addCharacter);
app.post('/character/create', createCharacter);
app.put('/character/:id', updateCharacter);
app.delete('/character/:id', deleteCharacter);

// callback functions
function showAllCharacters(req, res) {
    const url = 'http://hp-api.herokuapp.com/api/characters';

    superagent.get(url).then((data) => {
        const characters = data.body.map((character) => {
            return new Character(character);
        });
        res.render('pages/index', { characters: characters });
    });
}

function addCharacter(req, res) {
    const { name, house, patronus, alive } = req.body;
    const safeValues = [name, house, patronus, alive, 'api'];
    const sqlQuery = `INSERT INTO characters (name, house, patronus, is_alive, created_by) VALUES ($1, $2, $3, $4, $5);`;

    client.query(sqlQuery, safeValues).then(() => {
        res.redirect('/character/my-fav-characters');
    });
}

function showAllFavorites(req, res) {
    const sqlQuery = `SELECT * FROM characters WHERE created_by='api';`;
    client.query(sqlQuery).then((results) => {
        res.render('pages/favorites', { favorites: results.rows });
    });
}

function viewDetails(req, res) {
    const charId = req.params.id;
    const safeValues = [charId];
    const sqlQuery = `SELECT * FROM characters WHERE id=$1;`;

    client.query(sqlQuery, safeValues).then((result) => {
        res.render('pages/details', { character: result.rows[0] })
    });
}

function updateCharacter(req, res) {
    const charId = req.params.id;
    const { name, house, patronus, alive } = req.body;
    const safeValues = [name, house, patronus, alive, charId];
    const sqlQuery = `UPDATE characters SET name=$1, house=$2, patronus=$3, is_alive=$4 WHERE id=$5;`;

    client.query(sqlQuery, safeValues).then((result) => {
        res.redirect(`/character/${charId}`);
    });
}

function deleteCharacter(req, res) {
    const charId = req.params.id;
    const safeValues = [charId];
    const sql = `DELETE FROM characters WHERE id=$1;`;

    client.query(sql, safeValues).then(() => {
        res.redirect(`/character/my-fav-characters`)
    });
}

function renderCreatePage(req, res) {
    res.render('pages/new');
}

function createCharacter(req, res) {
    const { name, house, patronus, alive } = req.body;
    const safeValues = [name, house, patronus, alive, 'user'];
    const sql = `INSERT INTO characters (name, house, patronus, is_alive, created_by) VALUES ($1, $2, $3, $4, $5);`;

    client.query(sql, safeValues).then(() => {
        res.redirect('/character/my-characters');
    });
}


function showAllCreatedCharacters(req, res) {
    const safeValues = ['user'];
    const sql = `SELECT * FROM characters WHERE created_by=$1;`;

    client.query(sql, safeValues).then((results) => {
        res.render('pages/created', { characters: results.rows });
    });
}

// constructor functions
const Character = function(character) {
    this.name = character.name;
    this.house = character.house;
    this.patronus = character.patronus;
    this.alive = character.alive;
}