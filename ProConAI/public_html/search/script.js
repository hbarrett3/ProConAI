/*
    Authors: Jacob Truman
             Daniel Lott
             Harrison Barrett
    
    Instructor: Benjamin Dicken
    Course: CSC 337

    Project: ProConAI (Final Project)

    Description:

    This file is the client-side javascript for the search page for the website ProConAI
*/
// QUERY PROCESSING -----------------------------------------------------------------------------------------------------------


    

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

function displaySearchResults(data) {
    let resultsDiv = document.getElementById("search-results");

    let formattedData = data.replace(/\n/g, '<br>');
    resultsDiv.innerHTML = formattedData;
}

/**
 * 
 * @param {boolean} regenerate - if true, will regenerate the page
 */
function search(regenerate){
    // window.location.href = 'search/index.html?query=' + encodeURIComponent(search_input.value);

    let search_input = document.getElementById("search-input");
    let loadingAnimation = document.getElementById("loading-animation");
    let resultsDiv = document.getElementById("search-results");

    // checking if input is not empty (will execute if true)
    if (search_input.value.length > 0)
    {
        resultsDiv.innerHTML = '';
        loadingAnimation.style.display = 'block';
        // Create new ProCon
        let proConData = {
            name: search_input.value,
        };
        // if regenerate is true
        if (regenerate) {
            fetch('/search/regenerate/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(proConData),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                loadingAnimation.style.display = 'none';
                displaySearchResults(data);
            })
            // fail
            .catch((error) => {
                loadingAnimation.style.display = 'none';
                window.alert("SERVER NOT RESPONDING");
                console.error("Error:", error);
            });
        }
        else {
            // Send the ProCon data to the server
            fetch('/search/procon/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(proConData),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                loadingAnimation.style.display = 'none';
                displaySearchResults(data);
            })
            // fail
            .catch((error) => {
                loadingAnimation.style.display = 'none';
                window.alert("SERVER NOT RESPONDING");
                console.error("Error:", error);
            });
        }
    }
    else{
        window.alert("Field must be filled in");
    }
}

function onPageLoadSearch() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query');

    if (query) {
        search();
    }
}
// -----------------------------------------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', onPageLoadSearch);