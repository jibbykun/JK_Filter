let filterId = "filterData";
let filterData = {
    data: []
};

function exportData(filename){
    chrome.storage.sync.get(filterId, function(chromeData) {
        let file = new Blob([ JSON.stringify(chromeData.filterData.data) ], { type: 'text/plain' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(file);
        a.download = filename + '.json';
        a.click();
    });
    chrome.storage.sync.remove(filterId, function() {
        console.log("Data cleared.");
    });
}

function isEmpty(object) {
    for(var prop in object) {
        if(object.hasOwnProperty(prop))
            return false;
    }
    return true;
}

function updateStatus(status){
    document.getElementById('status-jkfilter').innerText = status;
}

document.addEventListener('DOMContentLoaded', function() {
    let trainer = document.getElementById('trainer-jkfilter');
    let clear = document.getElementById('clear-jkfilter');
    let exportTrain = document.getElementById('export-train-jkfilter');
    let exportTest = document.getElementById('export-test-jkfilter');

    trainer.addEventListener('click', function() {
        let inputData = document.getElementById('data-jkfilter').value;
        let filter = document.getElementById('filter-jkfilter').value === "filter";
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
    });

    clear.addEventListener('click', function() {
        chrome.storage.sync.remove(filterId, function() {
            console.log("Data cleared.");
        });
        updateStatus('Status: Data cleared.');
    });

    exportTrain.addEventListener('click', function() {
        exportData('trainingData');
        updateStatus('Status: Data exported.');
    });

    exportTest.addEventListener('click', function() {
        exportData('testingData');
        updateStatus('Status: Data exported.');
    });
});



