// ********************* WEATHER TRIVIA CONCEPT ********************* //

// User is asked weather-related questions e.g., Which city is currently warmer? and given two cities as options. 
// Weather data is dynamically fetched, so correct answers change depending on the date/time. 
// Reponse options have the corresponding cities as background images. These images are also dynamically generated 
// using Unsplash API and change each time a response is generated.



// ********************* GLOBAL VARIABLES: GAMEPLAY ********************* //

let round = 1;                      //current round; e.g., Which city is warmer?
let qNum = 1;                       //current question within each round e.g., Toronto or Mumbai?
let score = 0;                      //user's current score based on correctly answered questions                  
let countriesForCurrRound = [];     //a subset of countries used for the current round
let photoUrlsForCurrentRound = [];  //photo urls of the countries used in the current round
let responsesForCurrQuestion = [];  //the two countries selected for the current question
let tempDiffForCurrResponses;       //the difference in temperature for the two countries selected as responses to the current question.


// ********************* GLOBAL VARIABLES: APIs ********************* //
const keyUnsplash = `9d2643c16b551568584613649732c462489b9c5b3345d97fc36c18eb93099b01` //key for unsplash API 
const keyWeather = `02c4644c87236c45fb9220e04f2934bb`; //key for weather API
const urlWeather = `https://api.openweathermap.org/data/2.5/group?units=metric&appid=${keyWeather}&id=524901,703448,2643743,5128638,127026,6455259,727011&units=metric`; // url for Weather API, selects countries by id; selected countries are chosen because available on Unsplash


// ********************* APPLICATION ********************* //
fetch( urlWeather ).then( responseWeather => {
    responseWeather.json().then( dataWeather => {
        //populate the list of countries for the current round with data from the weather API
        countriesForCurrRound = dataWeather.list; // FIX ME: round must not take all API countries but only a random subset 
        //function takes two random countries from the countriesForCurrRound array to serve as response options for the current question;
        getResponseOpts ();
        //Promise waits for all fetches to complete, then we execute operations on the fetched data
        Promise.all(responsesForCurrQuestion.map((option) => {
            //for each respons option, fetch returns an object containing 10 unsplash images that match that option;
            return fetch( `https://api.unsplash.com/search/photos/?client_id=${keyUnsplash}&query="${option.name} city"&orientation=landscape` ).then( responsePhoto => {
                    return responsePhoto.json();
                })
            //produces an array of the fetched search objects
            })).then((results) => {
            //for each of the fetched search options, function picks a random image url and pushes it to a new array of urls.
            results.forEach((dataPhoto) => {
                photoUrlsForCurrentRound.push(dataPhoto.results[getRandomElementIndexFromAnArray(dataPhoto.results)].urls.regular);
            });
            //generate top bar with score and question number
            printTopBar (qNum, score);
            //generate options as HTML
            printResponseOpts ();
        });

        // photoUrlsForCurrentRound.push('https://images.pexels.com/photos/1034662/pexels-photo-1034662.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500');
        // photoUrlsForCurrentRound.push('../img/mumbai.jpg');
        // printResponseOpts ();
        
    });
});

// ********************* HELPER FUNCTIONS ********************* //

//function takes an array and returns the index of a random element from the given array
const getRandomElementIndexFromAnArray = (array) => {
    const index = Math.floor(Math.random()*array.length); 
    return index;
}

//function gets two random countries from the list of countries available for this round to serve as response options for a given question
const getResponseOpts = () => {
    //assign a random country to resonse 1
    let responseOneIndex = getRandomElementIndexFromAnArray (countriesForCurrRound);
    let responseOne = countriesForCurrRound[responseOneIndex];
    //method temporarily removes the assigned country from the array, so that the two response options don't end up the same;
    countriesForCurrRound.splice(responseOneIndex, 1);
    //assign another random country to response 2
    let responseTwo = countriesForCurrRound[ getRandomElementIndexFromAnArray (countriesForCurrRound)];
    //method returns the country from response 1 to the array;
    countriesForCurrRound.push(responseOne);
    //method pushes the two response options into a separate array;
    responsesForCurrQuestion.push(responseOne, responseTwo);


//Calculate the difference between the temperatures of the two responses for a given question; 
    tempDiffForCurrResponses = responsesForCurrQuestion[0].main.temp - responsesForCurrQuestion[1].main.temp;
}

//Function takes a question number and a score and displays a string of formatted HTML representing the top bar of the page
const printTopBar = (qNum, score) => {
    document.getElementById(`top-bar`).innerHTML = `
        <h1 class="screen-title bold">Question ${qNum}</h2>
            <div class="score bold">
                Score: ${score}
            </div>
    `
}

//Function takes a country and returns a string of formatted HTML representing a country as a response option
const getCountryAsHtml = (city, photoUrl) => {
// <img src="${photoUrl}">
    return `
        <li class="response-opt" style="background-image: url('${photoUrl}'); background-size: cover;">
            <button class="button-opt" id="${city.id}">
                <div class="text-info">
                    <div class="response-name" id="response-name-${city.id}">${city.name}, ${city.sys.country}</div>
                    <div class="answer-fdb hidden"> 
                        <img src="#">
                        <span class="degrees">${city.main.temp}</span>
                    </div>
                </div>
            </button>
        </li>
`
};


//For each of the response options, function creates a string of formatted html
const printResponseOpts = () => {
    document.getElementById (`response-opts`).innerHTML = responsesForCurrQuestion.map((city, index) => getCountryAsHtml(city, photoUrlsForCurrentRound[index])).join(``);
};


// ********************* INTERACTIVE ELEMENTS ********************* //
// add an event listener to the parent "response opts" 
document.getElementById(`response-opts`).addEventListener (`click`, (event) => {
    //search for a button in the parent and when one is found assign it to a variable
    const btn = event.target.closest(`button`);
    //if the button doesn't match the right class, do nothing; if it does, proceed.
    if(!btn.matches(`.button-opt`)) 
        return;
    //get all elements with the class "answer-fdb" and put them into an array; For each element in the array, make fdb appear after user clicks on a response
    Array.from(document.getElementsByClassName(`answer-fdb`)).forEach((fdb) => {
        fdb.classList.remove(`hidden`);
    });

    //Disable btns after user clicks on one of them
    document.getElementById(`response-opts`).classList.add (`disabled`);

    //update score; +1 when correct; 
    if (tempDiffForCurrResponses<=0 && btn.id==responsesForCurrQuestion[0].id){
        document.getElementById(`response-name-${btn.id}`).classList.add(`wrong`);
    } else if (tempDiffForCurrResponses<0 && btn.id==responsesForCurrQuestion[1].id){
        document.getElementById(`response-name-${btn.id}`).classList.add(`correct`);
        score ++;
    } else if (tempDiffForCurrResponses>0 && btn.id==responsesForCurrQuestion[0].id){
        document.getElementById(`response-name-${btn.id}`).classList.add(`correct`);
        score ++;
    } else if (tempDiffForCurrResponses>=0 && btn.id==responsesForCurrQuestion[1].id){
        document.getElementById(`response-name-${btn.id}`).classList.add(`wrong`);
    }
    //print new score as part of the event
    printTopBar (qNum, score);

});



