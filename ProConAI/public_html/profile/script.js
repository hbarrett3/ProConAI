/*
    Authors: Jacob Truman
             Daniel Lott
             Harrison Barrett
    
    Instructor: Benjamin Dicken
    Course: CSC 337

    Project: ProConAI (Final Project)

    Description:

    This file is the client-side javascript for the profile page for the website ProConAI
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

function search() {
    let search_input = document.getElementById("search-input");

    if (search_input.value.length > 0) {
        // Redirect to the new page with the search query as a parameter
        window.location.href = 'search/index.html?query=' + encodeURIComponent(search_input.value);
    }
}


// -----------------------------------------------------------------------------------------------------------
