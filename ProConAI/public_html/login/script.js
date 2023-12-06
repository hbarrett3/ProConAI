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
/**
 * Redirects the user to the search page.
 * @param {string} name - The name of the user.
 */
function goToSearchPage(name){
    window.location.href = '../search/index.html'; // should be one below
    // window.location.href = '../search/index.html/get/'+name;
}


/**
 * Redirects the user to the home page.
 */
function goToHomePage(){
    window.location.href = '../home/index.html';
}

/**
 * Performs a search based on the input value and redirects to the search results page.
 */
function search() {
    let search_input = document.getElementById("search-input");

    if (search_input.value.length > 0) {
        // Redirect to the new page with the search query as a parameter
        window.location.href = 'search/index.html?query=' + encodeURIComponent(search_input.value);
    }
}

// -----------------------------------------------------------------------------------------------------------

/**
 * Adds a new user by sending user data to the server.
 */
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
            password: password_input.value
        };
        
        // Send the user data to the server
        let p = fetch('/add/user/', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(userData)
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


/**
 * Performs a login operation by sending the user credentials to the server for verification.
 */
function login() {

    let username_input = document.getElementById('login-username-input').value;
    let password_input = document.getElementById('login-password-input').value;
    let newUser = {username: username_input, password: password_input}; // user sent to server to check

    let p = fetch('/user/login/', {
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
            alert('Welcome ' + username_input);
            goToHomePage(); // sending user to home page
        } 
        else {
            alert(text);
        }
    });
}

/**
 * makes the password visible
 */
function showPass() {
    changeLoginIcon();
    var x = document.getElementById("login-password-input");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
  }
  
/**
  * makes the password visible for new accounts
  */
function showNewPass() {
    changeSignUpIcon()
    var x = document.getElementById("sign-up-password-input");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
}

/**
 * Toggles the visibility icon for the sign-up form.
 */
function changeSignUpIcon() {
    var x = document.getElementById('eyeSignup');
    if (x.className ==="far fa-eye-slash") {
        x.className = "far fa-eye";
    } else {
        x.className = "far fa-eye-slash";
    }
}

/**
 * Changes the login icon based on its current state.
 */
function changeLoginIcon() {
    var x = document.getElementById('eyeLogin');
    if (x.className ==="far fa-eye-slash") {
        x.className = "far fa-eye";
    } else {
        x.className = "far fa-eye-slash";
    }
}