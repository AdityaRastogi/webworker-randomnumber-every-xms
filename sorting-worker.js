self._state = {};

/**
 * @param state
 * insertionSort() updates arrayToSort , startIndex, endIndex variables to start sorting
 * and breaks outerloop once state.pause is true which means new number has been added
 */
function insertionSort(state) {
  let arrayToSort = state.arrayToSort;
  let startIndex = state.startIndex;
  let endIndex = state.endIndex;

  outerloop: for (var i = startIndex; i < endIndex; i++) {
    const currentValue = arrayToSort[i];
    for (var j = i - 1; j > -1 && arrayToSort[j] > currentValue; j--) {
      arrayToSort[j + 1] = arrayToSort[j];
    }
    arrayToSort[j + 1] = currentValue;
    if (state.pause) {
      break outerloop;
    }
  }
  state.startIndex = i++;
}

/**
 * @param state
 * setState() sets self._state with state being passed as param
 */
function setState(state) {
  self._state = state
}

/**
 * @param state
 * applySort() calls insertionSort () and update with new time difference between
 * sortingStartTime and sortingEndTime after adding to previous value
 */
function applySort(state) {
  const sortingStartTime = new Date().getTime();
  insertionSort(state);
  const sortingEndTime = new Date().getTime();
  self._state.totalTimeTaken += sortingEndTime - sortingStartTime;
}

/**
 * @param state
 * calculateStartAndEndIndex() updates state object with startIndex and endIndex and
 * @returns state
 */
function calculateStartAndEndIndex(state) {
  state.startIndex = state.endIndex;
  var futureEndIndex = state.endIndex + 100;
  state.endIndex = futureEndIndex <= state.arrayToSort.length ? futureEndIndex : state.arrayToSort.length;
  return state;
}

/**
 * sorting() on interval of 2 ms checks whether array is Sorted or not, if not sorted sets pause state as false
 * and start sorting and calculate start and end index of array else, post message to UI thread as SORTED
 * @param state
 */

function sorting(state) {
  const sort = setInterval(function () {
    if (state.arrayToSort.length > state.startIndex + 1) {
      state.pause = false;
      if (! state.pause) {
        applySort(state);
        calculateStartAndEndIndex(state);
      } else {
        clearInterval(sort);
        sorting(state);
      }
    } else {
      clearInterval(sort);
      self.postMessage({ message: 'SORTED', sortingTime:state.totalTimeTaken, state:state });
    }
  }, 2);
}

/**
 * Listens to message sent from UI Thread to worker as : 'SORT','NUMBER_TO_ADD'
 */

self.addEventListener('message', function (message) {
  const messageData = message.data;
  switch (messageData['message']) {
    case 'SORT':
      setState(messageData['state']);
      sorting(self._state);
      break;
    case 'NUMBER_TO_ADD':
      self._state.pause = true;
      self._state.arrayToSort.push(messageData['number']);
      self.postMessage({ message: 'NUMBER_ADDED', state: messageData['state'], number: messageData['number'] });
      break;
  }
}, false);