/*
    Authors: Jacob Truman
             Daniel Lott
             Harrison Barrett
    
    Instructor: Benjamin Dicken
    Course: CSC 337

    Project: ProConAI (Final Project)

    Description:

    This file is the server for the website ProConAI
*/

const port = 80; // port
const DOURL = '127.0.0.1'; // URL for Digital Ocean
const express = require('express');
const app = express();
const parser = require('body-parser'); // used for JSON 
const cookieParser = require('cookie-parser');
const cors = require('cors'); // allows access
const mongoose = require("mongoose");

// Connect to MongoDB
const db = mongoose.connection;
const mongoDBURL = 'mongodb://127.0.0.1:27017/proConAI';
mongoose.connect(mongoDBURL, { useNewUrlParser: true, useUnifiedTopology: true });
db.on('error', () => {
    console.log('MongoDB connection error')
});

// SCHEMAS ----------------------------------------------------------------------------------------------------------------

// Schema for users
var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    favorites: [String] // should be ProConSchema
});
var User = mongoose.model('User', UserSchema);

// Schema for ProCons
var ProConSchema = new mongoose.Schema({
    name: String,
    accessCount: Number,
    AIPros: [String], // should be AIResponseSchema
    AICons: [String], // should be AIResponseSchema
    UserPros: [String], // should be UserPostSchema
    UserCons: [String] // should be AIResponseSchema
});
var ProCon = mongoose.model('ProCon', ProConSchema);

// Schema for AIResponses
var AIResponseSchema = new mongoose.Schema({
    name: String,
    
});
var AIResponse = mongoose.model('AIResponse', AIResponseSchema);

// Schema for UserPosts
var UserPostSchema = new mongoose.Schema({
    name: String,
});
var UserPost = mongoose.model('UserPost', UserPostSchema);

// SESSIONS and AUTHENTICATION -----------------------------------------------------------------------------------------

// object for holding current user sessions
let sessions = {};
    
// adds user to sessions, giving them a session ID and a time
function addSession(username) {
    let sid = Math.floor(Math.random() * 1000000000);
    let now = Date.now();
    sessions[username] = {id: sid, time: now};
    return sid;
}

// removes users from session if their time has expired (set to 5 minutes)
function removeSessions() {
    let now = Date.now();
    let usernames = Object.keys(sessions);
    for (let i = 0; i < usernames.length; i++) {
        let last = sessions[usernames[i]].time;
        if (last + 300000 < now) {
            delete sessions[usernames[i]];
        }
    }
    console.log(sessions);
}
    
setInterval(removeSessions, 2000); // calls removeSessions() every 2 seconds

// ensures that the user trying to access session-only pages has a valid session
// sends user to login page if they don't have a session or are not logged in
function authenticate(req, res, next) {
    let c = req.cookies.login;
    console.log('auth request:');
    // if there are no cookies
    if (c != undefined) {
        // if there are cookies, but no users with sessions
        if (sessions[c.username] != undefined && 
            sessions[c.username].id == c.sessionID) {
            let sid = addSession(c.username); // adding session for this user
            // creating cookie for this user
            res.cookie("login", 
                {username: c.username, sessionID: sid}, 
                {maxAge: 60000 * 5 });
            next();
        }
    } 
    else {
        res.redirect('/login/index.html');  // send to login page
    }
}
    
app.use(parser.json()); // used for parsing JSON objects
app.use(express.json());
app.use(cors()); // allows access
app.use(cookieParser()); // used for parsing cookies

// ensures authentication if users attempt to access the profile page
app.use('/profile/index.html', authenticate);

// ACCESS ----------------------------------------------------------------------------------------------------------------

app.use(express.static('public_html')); // allows access to home
app.use('*', authenticate);

// LOGIN ----------------------------------------------------------------------------------------------------------------

// this method logs in a user
// if the username and password typed in match inside the DB, then the server responds with a success message
app.post('user/login/', (req, res) => {
    let u = req.body;
    let p1 = User.find({username: u.username, password: u.password}).exec();
    p1.then( (results) => { 
        if (results.length == 0) {
            res.end('Unknown Username/password');
        } 
        else {
            let sid = addSession(u.username); // adding session for this user
            // creating cookie for this user
            res.cookie("login", 
                {username: u.username, sessionID: sid}, 
                {maxAge: 60000 * 5 });
            res.end('SUCCESS'); // success message 
        }
    });
});
    
// this method responds with the current user's username
app.get('/get/username/', (req, res) => {
    res.end(req.cookies.login.username); // fetching current user using cookies
});

// responds with a list of the users in the data base
app.get('/get/users/', (req, res) => {
    let p = User.find({}).exec();
    p.then((documents) => {
        res.end(JSON.stringify(documents));
    })
    .catch((error) => {
        console.log("PROBLEM WITH GETTING USERS");
        console.log(error);
    })
});


// called by login/script.js
// adds user to the data base, if user with the username doesn't exist already
app.post('/add/user/', (req, res) => {
    let p = User.find({username: req.body.username}).exec();
    p.then((documents) => {
        // if username doesn't exist already
        if (documents.length == 0){
            let newUser = new User({
                username: req.body.username,
                password: req.body.password,
                favorties: []
            });
            newUser.save()
            .then(() => {
                res.status(200).json({ status: "success", message: "User added!" });
            })
            .catch((error) => {
                console.log("PROBLEM ADDING USER");
                console.log(error);
            });
        }
        // if username already exists, throw new error
        else{
            res.status(400).json({ status: "error", message: "Username already exists!" });
        }
    })
    .catch((error) => {
        res.status(500).json({ status: "error", message: error });
        console.log(error);
    })
});

// HOME ----------------------------------------------------------------------------------------------------------------

app.get('/get/popular/', ()=> {
    let p = ProCon.find({}).exec();
    p.then((documents) => {
        res.end(JSON.stringify(documents[i]));
    })
    .catch((error) => {
        res.status(500).json({ status: "error", message: error });
        console.log(error);
    })
});


// PROFILE ----------------------------------------------------------------------------------------------------------------



// SEARCH ----------------------------------------------------------------------------------------------------------------



// COMMENTS ----------------------------------------------------------------------------------------------------------------



// ----------------------------------------------------------------------------------------------------------------

// method for getting ProCon
app.post('/search/procon/', ()=> {
    let p = ProCon.find({name: req.body.name}).exec();
    p.then((documents) => {
        // if ProCon doesn't exist already
        if (documents.length == 0){
            // new ProCon entry
            let newProCon = new ProCon({
                name: req.body.name,
                accessCount: req.body.accessCount,
                AIPros: req.body.AIPros, 
                AICons: req.body.AICons,
                UserPros: req.body.UserPros,
                UserCons: req.body.UserCons
            });
            newProCon.save()
            .then(() => {
                res.status(200).json({ status: "success", message: " added!" });
            })
            .catch((error) => {
                console.log("PROBLEM SAVING NEW PROCON");
                console.log(error);
            });
        }
        // if ProCon already exists
        else{
            res.end(JSON.stringify(documents[i]));
        }
    })
    .catch((error) => {
        res.status(500).json({ status: "error", message: error });
        console.log(error);
    })
});

// Start the Express server
app.listen(port, () => console.log(`App listening at http://${DOURL}:${port}`));