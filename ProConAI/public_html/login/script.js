/*
    Authors: Jacob Truman
             Daniel Lott
             Harrison Barrett
    
    Instructor: Benjamin Dicken
    Course: CSC 337

    Project: ProConAI (Final Project)

    Description:

    This file is the client-side javascript for the login page for the website ProConAI
*/

// COMMON CODE -----------------------------------------------------------------------------------------------------------

// this function sends the user directly to the search page of the given name
function goToSearchPage(name){
    window.location.href = '../search/index.html'; // should be one below
    // window.location.href = '../search/index.html/get/'+name;
}

// this function sends the user directly to the home page
function goToHomePage(){
    window.location.href = '../home/index.html';
}

// this function sends the user directly to their profile page if they're logged in
function goToCommentsPage(name){
    window.location.href = '../comments/index.html'; // should be one below
    // window.location.href = '../comments/index.html/get/'+name;
}

function search(){
    let search_input = document.getElementById("search-input");

    // checking if both inputs are not empty (will execute if true)
    if (search_input.value.length > 0)
    {
        // Create new ProCon
        let proConData = {
            name: search_input.value,
            accessCount: 1,
            AIPros: [],
            AICons: [],
            UserPros: [],
            UserCons: [],
        };
        
        // Send the ProCon data to the server
        fetch('/search/procon/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(proConData),
        })
        .then((response) => {
            window.alert("Searching: "+search_input.value);
            goToSearchPage(search_input.value);
        })
        // fail
        .catch((error) => {
            window.alert("SERVER NOT RESPONDING");
            console.log("Error:", error);
        });
    }
    else{
        window.alert("Field must be filled in");
    }
}

// -----------------------------------------------------------------------------------------------------------

function addUser(){

    // grabbing input elements from index.html
    let username_input = document.getElementById("sign-up-username-input");
    let password_input = document.getElementById("sign-up-password-input");

    // checking if both inputs are not empty (will execute if true)
    if (username_input.value.length > 0 && password_input.value.length > 0)
    {
        // Create new user
        let userData = {
            username: username_input.value,
            password: password_input.value,
            favorites: []
        };
        
        // Send the user data to the server
        fetch('/add/user/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData),
        })
        .then((response) => {
            // this is for dealing with the error thrown in server.js when a User with
            // username already exists
            if (!response.ok){
                return response.json().then((errorData) => {
                    throw errorData; // passes to the catch
                })
            }
            // success
            else{
                window.alert("User Successfully Added!");

                // setting input fields to empty for convenience
                username_input.value = "";
                password_input.value = "";
            }
            return response.json();
        })
        // fail
        .catch((error) => {
            if (error.message === "Username already exists!"){
                window.alert("Username already exists!");
            }
            else{
                window.alert("SERVER NOT RESPONDING");
            }
            console.log("Error:", error);
        });
    }
    else{
        window.alert("Fields must be filled in");
    }
}

// this function logs in a user
// it makes a request to the server, and if it is successful, meaning the username and passwords match,
// then the user is logged in, a session is started for them, and they are directed to the home page
function login() {

    let username_input = document.getElementById('login-username-input').value;
    let password_input = document.getElementById('login-password-input').value;
    let newUser = {username: username_input, password: password_input}; // user sent to server to check

    let p = fetch('user/login/', {
        method: 'POST', 
        body: JSON.stringify(newUser), // sending user
        headers: {"Content-Type": "application/json"}
    });
    p.then((response) => {
        return response.text();
    })
    .then((text) => {
        // success
        if (text.startsWith('SUCCESS')) {
            alert('Welcome '+username_input);
            goToHomePage(); // sending user to home page
        } 
        else {
            alert(text);
        }
    });
}
