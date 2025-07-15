// I want to build a server that API from ncs_songs.json file.
const express = require('express');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
var { engine } = require('express-handlebars');
const app = express();

const PORT = process.env.PORT || 3000;
// Middleware to parse JSON bodies
app.use(express.json());
app.use(morgan('combined')); // Logging middleware

// Template engine setup
app.engine(
    'hbs',
    engine({
        extname: '.hbs', // Set the file extension for Handlebars templates
        defaultLayout: 'main', // Specify the default layout
        layoutsDir: path.join(__dirname, 'resources/views/layouts'), // Set layouts directory
        partialsDir: path.join(__dirname, 'resources/views/partials'), // Set partials directory
    })
);
app.set('view engine', 'hbs'); // Set the view engine to Handlebars
app.set('views', path.join(__dirname, 'resources/views')); // Set views directory
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// Endpoint home page
app.get('/', (req, res) => {
    res.render('home', {
        title: 'Home Page',
    });
});
app.get('/news', (req, res) => {
    res.render('news', {
        title: 'News Page',
    });
});
// Endpoint to get all songs
app.get('/api/songs', (req, res) => {
    fs.readFile('statics/ncs_songs.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read songs file' });
        }
        const songs = JSON.parse(data);
        res.json(songs);
    });
});
// Endpoint to get a song by ID
app.get('/api/songs/:id', (req, res) => {
    const songId = parseInt(req.params.id, 10);
    // Dont have anything but browser is loading forever
    fs.readFile('statics/ncs_songs.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read songs file' });
        }
        const songs = JSON.parse(data);
        const song = songs.find((s) => s.id === songId);
        if (!song) {
            return res.status(404).json({ error: 'Song not found' });
        }
        res.json(song);
    });
});

// Run the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
// Handle 404 errors
app.use((req, res) => {
    res.status(404).send('Not Found');
});
// Handle errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
