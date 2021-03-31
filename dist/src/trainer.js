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

function updateStatus(status, id='status'){
    // Update the status bar, revert after 3 seconds
    document.getElementById(id).innerText = status;

    setTimeout(function(){ document.getElementById(id).innerText = "Status: "; }, 3000);
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

function modeSelect() {
    if (document.getElementById('predict').checked) {
        document.getElementById('prediction-mode').style.display = 'block';
        document.getElementById('training-mode').style.display = 'none';
        document.getElementById('building-mode').style.display = 'none';
    }
    else if (document.getElementById('train').checked) {
        document.getElementById('training-mode').style.display = 'block';
        document.getElementById('prediction-mode').style.display = 'none';
        document.getElementById('building-mode').style.display = 'none';
    } else{
        document.getElementById('building-mode').style.display = 'block';
        document.getElementById('training-mode').style.display = 'none';
        document.getElementById('prediction-mode').style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Pull all clickable buttons
    let trainer = document.getElementById('trainer');
    let clear = document.getElementById('clear');
    let exportTrain = document.getElementById('export-train');
    let exportTest = document.getElementById('export-test');
    let trainingMode = document.getElementById('train');
    let predictionMode = document.getElementById('predict');
    let buildingMode = document.getElementById('build');

    trainer.addEventListener('click', function() {
        // Store input
        let inputData = document.getElementById('data').value;
        let filterInput = document.getElementById('filter').value;
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

    trainingMode.addEventListener('click', function(){
        modeSelect();
    });

    predictionMode.addEventListener('click', function(){
        modeSelect();
    });

    buildingMode.addEventListener('click', function(){
        modeSelect();
    });
});


