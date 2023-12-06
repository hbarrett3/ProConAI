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

function addComment(buttonElement){

    let procon_id = buttonElement.getAttribute('data-proconid');
    let comment_input = document.getElementById("comment-input");

    if (comment_input.value.length > 0){

        window.alert("ADDING COMMENT\n"+comment_input.value);
        window.alert("procon_id\n"+procon_id);

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
                window.alert("Comment Successfully Added!");

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

function displayComments(comments, procon_id) {
    console.log("COMMENTS:");
    console.log(comments);
    let commentsDiv = document.getElementById("comments");
    let inner = '<label for="comment-input">Add comment: <input type="text" id="comment-input">' +
         '<button id="comment-button" data-proconid="' + procon_id + 
         '" onclick="addComment(this)">Comment</button><br><br><br>Comments ('+comments.length+'):<br><br>';

    if (comments.length == 0){
        inner += '<br><div>Be the first to comment!</div><br>';
    }

    for (let i = 0; i < comments.length; i++){
        inner += '<br><div>'+comments[i].author+' says: '+comments[i].comment+'</div><br>';
    }
    commentsDiv.innerHTML = inner;
}

function displaySearchResults(data) {

    let resultsDiv = document.getElementById("search-results");

    let formattedData = data.resp.replace(/\n/g, '<br>');
    resultsDiv.innerHTML = '<h2>Total views: '+data.accessCount+'</h2><br>'
                            +formattedData;
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
    let commentsDiv = document.getElementById("comments");

    // checking if input is not empty (will execute if true)
    if (search_input.value.length > 0)
    {
        resultsDiv.innerHTML = '';
        commentsDiv.innerHTML = '';
        loadingAnimation.style.display = 'block';
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

function onPageLoadSearch() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query');

    if (query) {
        search();
    }
}
// -----------------------------------------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', onPageLoadSearch);