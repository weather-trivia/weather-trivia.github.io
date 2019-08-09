// ********************* WEATHER TRIVIA CONCEPT ********************* //

// User is asked weather-related questions e.g., Which city is currently warmer? and given two cities as options. 
// Weather data is dynamically fetched, so correct answers change depending on the date/time. 
// Reponse options have the corresponding cities as background images. These images are also dynamically generated 
// using Unsplash API and change each time a response is generated.



// ********************* GLOBAL VARIABLES: GAMEPLAY ********************* //

let round = 1;                      //current round e.g., Which city is warmer?
let qNum = 1;                       //current question within each round e.g., Toronto or Mumbai?
let score = 0;                      //user's current score based on correctly answered questions                  
let countriesForCurrRound = [];     //a subset of countries used for the current round
let photoUrlsForCurrentQuestion = [];  //photo urls of the countries used in the current round
let responsesForCurrQuestion = [];  //the two countries selected for the current question
let tempDiffForCurrResponses;       //the difference in temperature for the two countries selected as responses to the current question.


// ********************* GLOBAL VARIABLES: APIs ********************* //
const keyUnsplash = `9d2643c16b551568584613649732c462489b9c5b3345d97fc36c18eb93099b01` //key for unsplash API 
const keyWeather = `02c4644c87236c45fb9220e04f2934bb`; //key for weather API
const urlWeather = `https://api.openweathermap.org/data/2.5/group?units=metric&appid=${keyWeather}&id=524901,703448,2643743,5128638,127026,6455259,727011,323786,3191281,6458923,6356055,1816670,1850147,7839805,112931,360630&units=metric`; // url for Weather API, selects countries by id; selected countries are chosen because available on Unsplash


// ********************* DOM LOCATIONS ********************* //
const $topBar = document.getElementById(`top-bar`);                                             //TOP BAR     
const $responseOpts = document.getElementById(`response-opts`);                                 //RESPONSE OPTIONS
const $scoreScreen = document.getElementById(`score-screen`);                                   //SCORE SCREEN
const $containerBtnNextQuestion = document.getElementById(`container-btn-next-question`);       //CONTAINER OF NEXT BUTTON
const $introScreen = document.getElementById(`intro-screen`);                                   //INTRO SCREEN
const $startBtnRound = document.getElementById(`start-btn-round`);                              //START BUTTON FOR ROUND
const $questionScreen = document.getElementById(`question-screen`);                             //QUESTION SCREEN
const $answerFdb = document.getElementsByClassName(`answer-fdb`);                               //FEEDBACK

// ********************* APPLICATION ********************* //

//function generates screen for questions
const generateQuestionsForRound = () => {
    fetch( urlWeather ).then( responseWeather => {
        responseWeather.json().then( dataWeather => {
            //populate the list of countries for the current round with data from the weather API
            countriesForCurrRound = dataWeather.list; // FIX ME: round must not take all API countries but only a random subset  
            printQuestionScreen ();
        });
    });
};


// ********************* HELPER FUNCTIONS: GENERAL ********************* //

//function takes an array and returns the index of a random element from the given array
const getRandomElementIndexFromAnArray = (array) => {
    const index = Math.floor(Math.random()*array.length); 
    return index;
}


// ********************* HELPER FUNCTIONS: GENERATE TOP BAR ********************* //
//Function takes a question number and a score and displays a string of formatted HTML representing the top bar of the page
const printTopBar = (qNum, score) => {
    $topBar.innerHTML = `
        <h1 class="screen-title bold">Question ${qNum}</h2>
            <div class="score bold">
                Score: ${score}
            </div>
    `
}

// ********************* HELPER FUNCTIONS: GENERATE RESPONSE OPTIONS ********************* //

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


//Function takes a country and returns a string of formatted HTML representing a country as a response option
const getCountryAsHtml = (city, photoUrl) => {
    console.log(city.weather[0].icon);
    return `
        <li class="response-opt" style="background-image: url('${photoUrl}'); background-size: cover;">
            <button class="button-opt" id="${city.id}">
                <div class="text-info">
                    <div class="response-name" id="response-name-${city.id}">${city.name}, ${city.sys.country}</div>
                    <div class="answer-fdb hidden"> 
                        <img src="http://openweathermap.org/img/wn/${city.weather[0].icon}.png">
                        <span class="degrees">${city.main.temp}&#8451</span>
                    </div>
                </div>
            </button>
        </li>
`
};


//For each of the response options, function creates a string of formatted html
const printResponseOpts = () => {
    $responseOpts.innerHTML = responsesForCurrQuestion.map((city, index) => getCountryAsHtml(city, photoUrlsForCurrentQuestion[index])).join(``);
};



// ********************* HELPER FUNCTIONS: GENERATE QUESTION SCREEN ********************* //
//function clears arrays for current question
const clearArraysforCurrentQuestion = () => {
    responsesForCurrQuestion = [];
    photoUrlsForCurrentQuestion = [];
}

//Function generates response screen for one question
const generateOneQuestion = () => {
    //function takes two random countries from the countriesForCurrRound array to serve as response options for the current question;
    getResponseOpts ();
    //for each of the current city response options, get a random photo of the city and push the url into a new array;
    responsesForCurrQuestion.forEach((option) => {
        photoUrlsForCurrentQuestion.push(`https://source.unsplash.com/random/600×400/?${option.name}`);
        });
    //generate options as HTML
    printResponseOpts ();
}

//function generates question screen
const printQuestionScreen = () => {
    printTopBar (qNum, score);
    generateOneQuestion ();
    printNextButton ();
}

//function generates next button
const printNextButton = (qNum) => {
    $containerBtnNextQuestion.innerHTML=`
    <button class="btn-next-question">
        <img src="img/next.svg" class="icon">
    </button>`   
}

// ********************* HELPER FUNCTIONS: GENERATE SCORE SCREEN ********************* //
const printScore = () => {
    $scoreScreen.innerHTML=`
    <div class="score-msg">
        You got ${score} out of ${qNum} questions. Try again!
    </div>
    `
}


// ********************* INTERACTIVE ELEMENTS ********************* //

// ****************************************** //


// ********************* BEGIN ROUND ********************* //
//when "start round" button is clicked, the intro screen becomes hidden and the relevant content is generated
    $startBtnRound.addEventListener (`click`, (event) => {
    $introScreen.classList.add(`hidden`);  
    $questionScreen.classList.remove(`hidden`);
    generateQuestionsForRound (); 
});

// ********************* RESPOND TO QUESTION ********************* //

// add an event listener to the parent "response opts" 
$responseOpts.addEventListener (`click`, (event) => {
    //search for a button in the parent and when one is found assign it to a variable
    const btn = event.target.closest(`button`);
    //if the button doesn't match the right class, do nothing; if it does, proceed.
    if(!btn.matches(`.button-opt`)) 
        return;
    //get all elements with the class "answer-fdb" and put them into an array; For each element in the array, make fdb appear after user clicks on a response
    Array.from($answerFdb).forEach((fdb) => {
        fdb.classList.remove(`hidden`);
    });

    //Disable btns after user clicks on one of them
    $responseOpts.classList.add (`disabled`);

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


// ********************* GO TO NEXT QUESTION ********************* //

//when button is clicked go to next question
    $containerBtnNextQuestion.addEventListener(`click`, (event) => {
    //search for a button in the parent and when one is found assign it to a variable
    const btn = event.target.closest(`button`);
    //if the button doesn't match the right class, do nothing; if it does, proceed.
    if(!btn.matches(`.btn-next-question`)) 
    {
        return; 
    }
    if(qNum == 5) {
        $scoreScreen.classList.remove(`hidden`);
        $questionScreen.classList.add(`hidden`);
        printScore ();
    } 
    //Enable previously diabled btns 
    $responseOpts.classList.remove (`disabled`);
    clearArraysforCurrentQuestion ();
    qNum ++; 
    printQuestionScreen ();

})

