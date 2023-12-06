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

/**
 * Navigates to the search page.
 * @param {string} name - The name parameter to pass to the search page.
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
 * Adds a comment to the server.
 * 
 * @param {HTMLElement} buttonElement - The button element that triggered the comment addition.
 * @returns {Promise} - A promise that resolves when the comment is successfully added or rejects with an error.
 */
function addComment(buttonElement){

    let procon_id = buttonElement.getAttribute('data-proconid');
    let comment_input = document.getElementById("comment-input");

    if (comment_input.value.length > 0){

        // Create new comment
        let commentData = {
            comment: comment_input.value,
            procon_id: procon_id
        };
        
        // Send the user data to the server
        let p = fetch('/add/comment/', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(commentData)
        })
        .then((response) => {
            if (!response.ok){
                return response.json().then((errorData) => {
                    throw errorData; // passes to the catch
                })
            }
            // success
            else{
                window.alert("ADDING COMMENT\n"+comment_input.value);
                // setting input field to empty for convenience
                comment_input.value = "";

            }
            return response.json();
        })
        // fail
        .catch((error) => {
            window.alert(error.message);
            console.log("Error:", error);
        });
    }
    else{
        window.alert("Field must be filled in!");
    }

}

/**
 * Displays comments on the webpage.
 * 
 * @param {Array} comments - An array of comment objects.
 * @param {string} procon_id - The ID of the procon.
 */
function displayComments(comments, procon_id) {
    let commentsDiv = document.getElementById("comments-div");
    commentsDiv.style.display = 'none';
    let inner = '<div id="comments"><h1>Comments ('+comments.length+')</h1><br><label for="comment-input">'+
                'Add comment: <input type="text" id="comment-input" placeholder="ex: I agree/disagree with...">' +
                '<button id="comment-button" data-proconid="' + procon_id + 
                '" onclick="addComment(this); search(false)">Comment</button><br><br>';

    if (comments.length == 0){
        inner += '<br><div>Be the first to comment!</div><br>';
    }

    for (let i = 0; i < comments.length; i++){
        inner += '<br><div>'+comments[i].author+' says: '+comments[i].comment+'</div><br>';
    }
    inner += '</div>';
    commentsDiv.innerHTML = inner;
    commentsDiv.style.display = 'block';
}

/**
 * Displays the search results on the webpage.
 * 
 * @param {Object} data - The search results data.
 * @param {string} data.resp - The formatted search results.
 * @param {number} data.accessCount - The total number of views.
 */
function displaySearchResults(data) {

    let resultsDiv = document.getElementById("search-results");

    let formattedData = data.resp.replace(/\n/g, '<br><br>');
    resultsDiv.innerHTML = '<h2>Total views: '+data.accessCount+'</h2><br>'
                            +formattedData;
}

/**
 * Performs a search operation based on the given input.
 * If `regenerate` is true, it sends a request to the server to regenerate the search results.
 * Otherwise, it sends the ProCon data to the server for search.
 * @param {boolean} regenerate - Indicates whether to regenerate the search results.
 */
function search(regenerate){
    // window.location.href = 'search/index.html?query=' + encodeURIComponent(search_input.value);

    let search_input = document.getElementById("search-input");
    let loadingAnimation = document.getElementById("loading-animation");
    let resultsDiv = document.getElementById("search-results");
    let commentsDiv = document.getElementById("comments-div");

    // checking if input is not empty (will execute if true)
    if (search_input.value.length > 0)
    {
        resultsDiv.innerHTML = '';
        commentsDiv.innerHTML = '';
        loadingAnimation.style.display = 'block';
        commentsDiv.style.display = 'none';
        // Create new ProCon
        let proConData = {
            name: search_input.value
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
                displayComments(data.comments, data._id);
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
                displayComments(data.comments, data._id);
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

/**
 * Fills the search input field with the given query.
 * 
 * @param {string} query - The query to fill the search input with.
 */
function fillSearchInput(query) {
    let searchInput = document.getElementById("search-input");
    searchInput.value = query;
}

document.addEventListener('DOMContentLoaded', (event) => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    if (name) {
        fillSearchInput(name);
        search(false);
    }
});