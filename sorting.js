const sortingWorker = new Worker('sorting-worker.js');
let randomNumberGenerate;
let randomNumberObject = {};
let stopRandomNumberGenerationButton;
let sortButton, randomNumberDurationInput, notifications;


/**
 * state object keep tracks of array state and processing time to sort
 * @type {{startIndex: number, endIndex: number, arrayToSort: Array, totalTimeTaken: number}}
 */
state = {
    startIndex: 0,
    endIndex: 500,
    arrayToSort: [],
    totalTimeTaken: 0
};

/**
 * on window load hide progressBar and Performance Box
 * and Registers addlog() and listener to sortingWorker
 */
window.onload = function () {
    stopRandomNumberGenerationButton = document.getElementById('stop-Duration');
    sortButton = document.getElementById('sorting-Button');
    randomNumberDurationInput = document.getElementById('duration');
    notifications = document.getElementById('pushNotifications');
    /**
     * hide progressBar and Performance Box
     */
    $("#progressbar").hide(0);
    $("#performanceBox").hide();

    /**
     * Enables sort Button once randomNumber duration has been added by user
     */
    randomNumberDurationInput.addEventListener('keyup', function intervalKeyup({ target: { value } }) {
        sortButton.disabled = !value;
    });

    /**
     *Addlog() creates new li node and update its innerHtml with message being passed as PARAM
     * @param message
     */
    function addLog(message) {
        const li = document.createElement('li');
        li.innerHTML = message;
        notifications.appendChild(li);
    }

    /**
     *Listens to the message being sent from SORTING WORKER as :'SORTED','NUMBER_ADDED'
     */
    sortingWorker.addEventListener('message', function (message) {
        const messageData = message.data;
        switch (messageData['message']) {
            case 'SORTED':
                randomNumberDurationInput.disabled = false; // Enables randomNumber Duration Input field
                sortButton.disabled = false; // Enables start Sorting button
                /**
                 * clears randomNumberGenerate interval
                 * so that no new number will be generated after Sorting is completed
                 */
                if (randomNumberGenerate) {
                    clearInterval(randomNumberGenerate);
                    randomNumberGenerate = null;
                    stopRandomNumberGenerationButton.disabled = true;
                }
                afterSortingStop(messageData['state'].arrayToSort.length,messageData['sortingTime']);
                break;
            case 'NUMBER_ADDED':
                var message = `${messageData['number']}- Number Added to Array message took ${new Date().getTime() - randomNumberObject[messageData['number']].numberAddedCommunicationStartTime} ms`;
                addLog(message);
                break;
        }
    }, false);
}


/**
 * initArray function returns array with 100k randomNumbers when sorting starts for first time
 */
function initArray(arrayCount) {
  let array = [];
  for (var i = 0; i < arrayCount; i++) {
      array.push((Math.floor(Math.random()*100000) + 1));
  }
  return array;
}

/**
 * createRandomNumberDurationInstance() creates random number after duration(xms) specified by user
 * and post message to sortWorker to add number in arrayToSort
 * @param timer
 * @returns {number}
 */
function createRandomNumberDurationInstance(duration) {
  return setInterval(() => {
    const numberToAdd = Math.floor(Math.random() * 100000) + 1;
    sortingWorker.postMessage({ message: 'NUMBER_TO_ADD', number: numberToAdd });
    randomNumberObject[numberToAdd] = { numberAddedCommunicationStartTime: new Date().getTime() };
  }, duration);
}

/**
 *startSorting() calls preSortStart() and
 * post message to SORT the array and gets intervalInstance from createRandomNumberDurationInstance(),
 * and also disables randomNumberDurationInput and sortButton
 */
function startSorting() {
    state.arrayToSort = initArray(100000);
    preSortStart();
    sortingWorker.postMessage({ message: 'SORT', state: state });
    randomNumberGenerate = createRandomNumberDurationInstance(randomNumberDurationInput.value);
    stopRandomNumberGenerationButton.disabled = false;
    randomNumberDurationInput.disabled = true;
    sortButton.disabled = true;
}



/**
 * preSortStart() shows the progress bar and hides the performance box and reset pushNotifications div
 */
function preSortStart() {
    $('#pushNotifications').html('');
    $("#performanceBox").hide(500);
    $("#uiAndWorkerCommunicationBox").hide();
    $("#progressbar").show(500);
}

/**
 * afterSortingStop() hides the progress bar and shows the performance box with time taken for sorting
 */
function afterSortingStop(arrayLength, spentTime) {
    $("#arrayLengthSorted").html("Array of length " + arrayLength + " Sorted in:");
    $("#timespent").html(spentTime + "ms");
    $("#progressbar").hide(500, function () {
        $("#uiAndWorkerCommunicationBox").show();
        $("#performanceBox").show(500);
    });
}

/**
 * stopRandomNumberGeneration() gets called once User clicks stop-timer button and clears randomNumberGenerate interval
 * so that no new number will be generated
 */
function stopRandomNumberGeneration() {
    if (randomNumberGenerate) {
        clearInterval(randomNumberGenerate);
        randomNumberGenerate = null;
        stopRandomNumberGenerationButton.disabled = true;
        state.pause = false;
    }
}

