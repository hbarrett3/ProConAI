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
            console.error("Error:", error);
        });
    }
    else{
        window.alert("Field must be filled in");
    }
}

// -----------------------------------------------------------------------------------------------------------
