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

const port = 3000; // port
const DOURL = '127.0.0.1'; // URL for Digital Ocean
const express = require('express');
const app = express();
const parser = require('body-parser'); // used for JSON 
const cookieParser = require('cookie-parser');
const cors = require('cors'); // allows access
const mongoose = require("mongoose");
const OpenAI = require("openai");
const openai = new OpenAI();

// Connect to MongoDB
const db = mongoose.connection;
const mongoDBURL = 'mongodb://127.0.0.1:27017/proConAI';
mongoose.connect(mongoDBURL);
db.on('error', () => {
    console.log('MongoDB connection error')
});

app.get('/', (req, res) => {
    res.redirect('/home/index.html');
});

// SCHEMAS ----------------------------------------------------------------------------------------------------------------

// Schema for users
var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
});
var User = mongoose.model('User', UserSchema);

// Schema for Comments
var CommentSchema = new mongoose.Schema({
    author: String,
    comment: String,
    procon_id: String
});
var Comment = mongoose.model('Comment', CommentSchema);

// Schema for ProCons
var ProConSchema = new mongoose.Schema({
    name: String,
    accessCount: Number,
    resp: String,
    keywords: String,
    comments: [CommentSchema]
});
var ProCon = mongoose.model('ProCon', ProConSchema);

// SESSIONS and AUTHENTICATION -----------------------------------------------------------------------------------------

// object for holding current user sessions
let sessions = {};
app.use(cookieParser()); // used for parsing cookies

/**
 * Adds a session for the specified username.
 * @param {string} username - The username for the session.
 * @returns {number} - The session ID.
 */
function addSession(username) {
    let sid = Math.floor(Math.random() * 1000000000);
    let now = Date.now();
    sessions[username] = { id: sid, time: now };
    return sid;
}

/**
 * Removes expired sessions from the sessions object.
 */
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

/**
 * Authenticates the user based on the provided request and response objects.
 * If the user is authenticated, the next middleware function is called.
 * If the user is not authenticated, an error response is sent.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
function authenticate(req, res, next) {
    let c = req.cookies.login;
    if (c != undefined) {
        console.log('auth request:');
        // if there are cookies, but no users with sessions
        if (sessions[c.username] != undefined &&
            sessions[c.username].id == c.sessionID) {
            let sid = addSession(c.username); // adding session for this user
            // creating cookie for this user
            res.cookie("login",
                { username: c.username, sessionID: sid },
                { maxAge: 60000 * 5 });
            next();
        }
    }
    else {
        res.status(401).json({ status: "error", message: "You need to be logged in to comment" }); // display message for authentication
    }
}

app.use(parser.json()); // used for parsing JSON objects
app.use(express.json());
app.use(cors()); // allows access

// ACCESS ----------------------------------------------------------------------------------------------------------------

app.use(express.static('public_html')); // allows access to home
app.use('/add/comment/', authenticate);

// LOGIN ----------------------------------------------------------------------------------------------------------------

// this method logs in a user
// if the username and password typed in match inside the DB, then the server responds with a success message
app.post('/user/login/', (req, res) => {
    let u = req.body;
    let p1 = User.find({ username: u.username, password: u.password }).exec();
    p1.then((results) => {
        if (results.length == 0) {
            res.end('Unknown Username/password');
        }
        else {
            let sid = addSession(u.username); // adding session for this user
            // creating cookie for this user
            res.cookie("login",
                { username: u.username, sessionID: sid },
                { maxAge: 60000 * 5 });
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
    let p = User.find({ username: req.body.username }).exec();
    p.then((documents) => {
        // if username doesn't exist already
        if (documents.length == 0) {
            let newUser = new User({
                username: req.body.username,
                password: req.body.password
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
        else {
            res.status(400).json({ status: "error", message: "Username already exists!" });
        }
    })
        .catch((error) => {
            res.status(500).json({ status: "error", message: error });
            console.log(error);
        })
});

// HOME ----------------------------------------------------------------------------------------------------------------
// gets most popular comments
app.get('/get/popular/', (req, res) => {
    let p = ProCon.find({}).exec();
    p.then((documents) => {
        res.end(JSON.stringify(documents));
    })
        .catch((error) => {
            res.status(500).json({ status: "error", message: error });
            console.log(error);
        })
});

// COMMENT ----------------------------------------------------------------------------------------------------------------
// called by search/script.js
// adds comment to procon
app.post('/add/comment/', (req, res) => {
    let p = ProCon.find({ _id: req.body.procon_id }).exec();
    p.then((documents) => {
        let newComment = new Comment({
            comment: req.body.comment,
            author: req.cookies.login.username,
            procon_id: req.body.procon_id
        });
        newComment.save()
            .then(() => {
                documents[0].comments.push(newComment);
                documents[0].save();
                res.status(200).json({ status: "success", message: "Comment added!" });
            })
            .catch((error) => {
                console.log("PROBLEM ADDING COMMENT");
                console.log(error);
            });
    })
        .catch((error) => {
            res.status(500).json({ status: "error", message: error });
            console.log(error);
        })
});

// SEARCH ----------------------------------------------------------------------------------------------------------------
/**
 * generates a new pro/con list based on the query
 * @param {String} query 
 * @returns 
 */
async function generateNew(query) {
    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: `give me 3 pros and 3 cons of ${query}. use 2 separate lists.` }],
            model: "gpt-3.5-turbo",
        });

        // console.log(completion.choices[0].message.content);
        return completion.choices[0].message.content;
    } catch (error) {
        console.error("Error in generating response:", error);
    }
}

/**
 * generates new keywords for the query
 * @param {String} query 
 * @returns 
 */
async function generateKeywords(query) {
    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: `give me 3 comma-separated keywords (not phrases) for this phrase: ${query}.` }],
            model: "gpt-3.5-turbo",
        });

        // console.log(completion.choices[0].message.content);
        return completion.choices[0].message.content;
    } catch (error) {
        console.error("Error in generating response:", error);
    }
}

//   generateKeywords("buying myself a new dog");

const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

/**
 * Normalizes the query by tokenizing, stemming, and joining the tokens
 * @param {*} query 
 * @returns 
 */
function normalizeKeywords(query) {
    return tokenizer.tokenize(query.toLowerCase())
        .map(token => stemmer.stem(token))
        .join(' ');
}

/**
 * normalizes the given query
 * @param {String} query 
 * @returns 
 */
function normalizeQuery(query) {
    return tokenizer.tokenize(query.toLowerCase())
        .map(token => stemmer.stem(token))
        .join(' ');
}


/**
 * Compares two queries based on the similarity of their keywords.
 * @param {string} query1 - The first query.
 * @param {string} query2 - The second query.
 * @returns {number} - The similarity score between 0 and 1.
 */
function compareKeywords(query1, query2) {
    words1 = new Set(query1.split(' '));
    words2 = new Set(query2.split(' '));

    let intersection = new Set([...words1].filter(x => words2.has(x)));
    let union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
}


/**
 * Compares two queries and returns the Jaccard similarity coefficient.
 * @param {string} query1 - The first query.
 * @param {string} query2 - The second query.
 * @returns {number} The Jaccard similarity coefficient between the two queries.
 */
function compareQueries(query1, query2) {
    words1 = new Set(query1.split(' '));
    words2 = new Set(query2.split(' '));

    let intersection = new Set([...words1].filter(x => words2.has(x)));
    let union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
}
//   similarityScore = compareKeywords(normalizeKeywords("dog, pet, ownership"), normalizeKeywords("dog, buying, ownership"));
//   console.log('Similarity Score:', similarityScore);

/**
 * contains the generation logic
 * @param {String} query 
 * @return {ProCon} database entry
 */
async function generation(newQuery) {
    return new Promise(async (resolve, reject) => {
        let map = new Map();
        let newKeywords = await generateKeywords(newQuery);

        try {
            let documents = await ProCon.find({}).exec();

            documents.forEach(doc => {
                let qSimilarityScore = compareQueries(normalizeQuery(newQuery), normalizeQuery(doc.name));
                let similarityScore = compareKeywords(normalizeKeywords(newKeywords), normalizeKeywords(doc.keywords));
                if (qSimilarityScore > 0.5) {
                    map.set(doc, qSimilarityScore);
                } else if (similarityScore > 0.5) {
                    map.set(doc, similarityScore);
                }
            });

            if (map.size > 0) {
                let sortedMap = new Map([...map.entries()].sort((a, b) => b[1] - a[1]));
                let firstEntry = sortedMap.entries().next().value[0];
                firstEntry.accessCount++;
                firstEntry.save();
                resolve(firstEntry);
            } else {
                let respValue = await generateNew(newQuery);
                let newEntry = new ProCon({
                    name: newQuery,
                    accessCount: 1,
                    resp: respValue,
                    keywords: newKeywords,
                    comments: []
                });
                await newEntry.save();
                resolve(newEntry);
            }
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Regenerates a new entry based on the given query.
 * @param {string} newQuery - The new query to generate the entry for.
 * @returns {Promise<Object>} - A promise that resolves to the newly generated entry.
 */
async function regenerate(newQuery) {
    let respValue = await generateNew(newQuery);
    let newEntry = new ProCon({
        name: newQuery,
        accessCount: 1,
        resp: respValue,
        keywords: await generateKeywords(newQuery),
        comments: []
    });
    await newEntry.save();
    return (newEntry);
}

/**
 * debug function that prints out the database
 */
app.get('/get/procons/', (req, res) => {
    let p = ProCon.find({}).exec();
    p.then((documents) => {
        res.end(JSON.stringify(documents));
    })
        .catch((error) => {
            res.status(500).json({ status: "error", message: error });
            console.log(error);
        })
});


// ----------------------------------------------------------------------------------------------------------------

// method for getting ProCon
app.post('/search/procon/', async (req, res) => {
    try {
        let results = await generation(req.body.name);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred in /search/procon');
    }
});

// method for regenerating ProCon
app.post('/search/regenerate/', async (req, res) => {
    try {
        let results = await regenerate(req.body.name)
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred in /search/procon');
    }
});

// Start the Express server
app.listen(port, () => console.log(`App listening at http://${DOURL}:${port}`));