let filterId = "filterData";
let filterData = {
    data: []
};

function isEmpty(object) {
    for(let prop in object) {
        if(object.hasOwnProperty(prop))
            return false;
    }
    return true;
}

function updateStatus(status){
    document.getElementById('status-jkfilter').innerText = status;

    setTimeout(function(){ document.getElementById('status-jkfilter').innerText = "Status: "; }, 3000);
}

function exportData(filename){
    chrome.storage.sync.get(filterId, function(chromeData) {
        if (isEmpty(chromeData[filterId])) {
            updateStatus('Status: Error. No filtered data found.');
            return;
        }
        let file = new Blob([ JSON.stringify(chromeData.filterData.data) ], { type: 'text/plain' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(file);
        a.download = filename + '.json';
        a.click();
    });
    chrome.storage.sync.remove(filterId, function() {
        console.log("Data cleared.");
    });
    updateStatus('Status: Data exported.');
}

document.addEventListener('DOMContentLoaded', function() {
    let trainer = document.getElementById('trainer-jkfilter');
    let clear = document.getElementById('clear-jkfilter');
    let exportTrain = document.getElementById('export-train-jkfilter');
    let exportTest = document.getElementById('export-test-jkfilter');

    trainer.addEventListener('click', function() {
        let inputData = document.getElementById('data-jkfilter').value;
        let filter = document.getElementById('filter-jkfilter').value === "filter";
        if(!inputData){
            updateStatus('Status: Error. Please fill in the fields correctly.');
        } else {
            let data = {
                data: []
            };

            chrome.storage.sync.get(filterId, function(chromeData) {
                if (isEmpty(chromeData[filterId])) {
                    let object = {};
                    object[filterId] = data;
                    chrome.storage.sync.set(object, function(d){
                        console.log("Initialised.");
                    });
                } else {
                    data = chromeData[filterId];
                    console.log(chromeData);
                }
                data.data.push(
                    {comment: inputData, toxic: filter}
                );

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
        chrome.storage.sync.remove(filterId, function() {
            console.log("Data cleared.");
        });
        updateStatus('Status: Data cleared.');
    });

    exportTrain.addEventListener('click', function() {
        exportData('trainingData');
    });

    exportTest.addEventListener('click', function() {
        exportData('testingData');
    });
});



