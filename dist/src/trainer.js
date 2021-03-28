// Initialise storage data
let filterId = "filterData";
let filterData = {
    data: []
};

function isEmpty(object) {
    // Check if an object is empty
    for(let prop in object) {
        if(object.hasOwnProperty(prop))
            return false;
    }
    return true;
}

function updateStatus(status){
    // Update the status bar, revert after 3 seconds
    document.getElementById('status-jkfilter').innerText = status;

    setTimeout(function(){ document.getElementById('status-jkfilter').innerText = "Status: "; }, 3000);
}

function exportData(filename){
    chrome.storage.sync.get(filterId, function(chromeData) {
        // Error handling
        if (isEmpty(chromeData[filterId])) {
            updateStatus('Status: Error. No filtered data found.');
            return;
        }
        // Store stored data as a json file and download it
        let file = new Blob([ JSON.stringify(chromeData.filterData.data) ], { type: 'text/plain' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(file);
        a.download = filename + '.json';
        a.click();
    });
    // Clear stored data
    chrome.storage.sync.remove(filterId, function() {
        console.log("Data cleared.");
    });
    updateStatus('Status: Data exported.');
}

document.addEventListener('DOMContentLoaded', function() {
    // Pull all clickable buttons
    let trainer = document.getElementById('trainer-jkfilter');
    let clear = document.getElementById('clear-jkfilter');
    let exportTrain = document.getElementById('export-train-jkfilter');
    let exportTest = document.getElementById('export-test-jkfilter');

    trainer.addEventListener('click', function() {
        // Store input
        let inputData = document.getElementById('data-jkfilter').value;
        let filterInput = document.getElementById('filter-jkfilter').value;
        let filter = filterInput === "filter";
        // Error handling
        if(!inputData || !filterInput){
            updateStatus('Status: Error. Please fill in the fields correctly.');
        } else {
            // Initialise data
            let data = {
                data: []
            };
            // Pull the stored data
            chrome.storage.sync.get(filterId, function(chromeData) {
                // If empty, initialise the data
                if (isEmpty(chromeData[filterId])) {
                    let object = {};
                    object[filterId] = data;
                    chrome.storage.sync.set(object, function(d){
                        console.log("Initialised.");
                    });
                } else {
                    // Log the stored data
                    data = chromeData[filterId];
                    console.log(chromeData);
                }
                // Push in the new input in JSON format
                data.data.push(
                    {comment: inputData, toxic: filter}
                );

                // Store the updated data
                let object = {};
                object[filterId] = data;
                chrome.storage.sync.set(object, function(d){
                    console.log("Data saved.");
                });
            });

            updateStatus('Status: Data added.');
        }
    });

    clear.addEventListener('click', function() {
        // Clear stored data
        chrome.storage.sync.remove(filterId, function() {
            console.log("Data cleared.");
        });
        updateStatus('Status: Data cleared.');
    });

    exportTrain.addEventListener('click', function() {
        // Export as training data
        exportData('trainingData');
    });

    exportTest.addEventListener('click', function() {
        // Export as testing data
        exportData('testingData');
    });
});



