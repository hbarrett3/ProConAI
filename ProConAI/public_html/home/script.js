/*
    Authors: Jacob Truman
             Daniel Lott
             Harrison Barrett
    
    Instructor: Benjamin Dicken
    Course: CSC 337

    Project: ProConAI (Final Project)

    Description:

    This file is the client-side javascript for the home page for the website ProConAI
*/

// COMMON CODE -----------------------------------------------------------------------------------------------------------

/**
 * Redirects the user to the search page.
 * @param {string} name - The name of the user.
 */
function goToSearchPage(name){
    window.location.href = '../search/index.html';
}

/**
 * Redirects the user to the home page.
 */
function goToHomePage(){
    window.location.href = '../home/index.html';
}

// SEARCHING CODE -----------------------------------------------------------------------------------------------------------

/**
 * Performs a search based on the input value and redirects to the search results page.
 */
function search() {
    let search_input = document.getElementById("search-input");

    if (search_input.value.length > 0) {
        // Redirect to the search page, filling in the search field with the query, and calling search(false) in the search pages's script.js
        window.location.href = '../search/index.html?name=' + encodeURIComponent(search_input.value);
    }
}


// -----------------------------------------------------------------------------------------------------------

/**
 * Adds a new user by sending user data to the server.
 */
function fillPopular(){
    let p = fetch('/get/popular/');
    p.then( (response) => {
        return response.json();
    })
    // success
    .then((objects) => {

        objects.sort((a, b) => b.accessCount - a.accessCount); // sorting
        // displaying items on home page
        let html = '';

        for (let i = 0; i < objects.length; i++) {
            if (i > 4) {
                break;
            }
            html += '<a class="popular-searches" href="../search/index.html?name=' + 
                    encodeURIComponent(objects[i].name) + '">' + objects[i].name + 
                    '</a><p>Total Views: ' + objects[i].accessCount + '</p><br><br>';
        }
        let popular_div = document.getElementById('popular-div');
        popular_div.innerHTML = html;
    }).catch(() => {
        alert('something went wrong');
    });

}

fillPopular();