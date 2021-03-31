require('regenerator-runtime/runtime');
const tf = require('@tensorflow/tfjs');
const useLoader = require('@tensorflow-models/universal-sentence-encoder');
let trainedModel;

async function initLoader(useLoader, sentences){
    console.log('Starting load');
    // Load the universal sentence encoder
    const use = await useLoader.load();
    console.log('Loaded Universal Sentence Encoder');
    console.log('Starting encoding');
    // Encode the data
    const embedding = await use.embed(sentences);
    console.log('Encoding complete.');
    return embedding;
}

async function encodeDataset(data){
    console.log("encodingdata",data);
    // Split the data for encoding
    const sentences = data.map(comment => comment.comment.toLowerCase());
    // Run the encoder
    const encodedData = initLoader(useLoader, sentences);
    return encodedData;
}

function buildModel() {
    // Build the model
    const model = tf.sequential();

    // Add layers
    model.add(tf.layers.dense({
        inputShape: [512],
        activation: 'sigmoid',
        units: 2,
    }));

    model.add(tf.layers.dense({
        inputShape: [2],
        activation: 'sigmoid',
        units: 2,
    }));

    model.add(tf.layers.dense({
        inputShape: [2],
        activation: 'sigmoid',
        units: 2,
    }));

    model.compile({
        loss: 'meanSquaredError',
        optimizer: tf.train.adam(.06),
        metrics: ['accuracy']
    });

    return model;
}

function onBatchEnd(batch, logs) {
    // Output the accuracy on batch end
    console.log('Accuracy', logs.acc);
}

async function trainModel(model, commentsTrain, toxicTrain, commentsTest) {
    try {
        updateStatus('Status: Starting.', 'status-train');
        // Encode the training data
        console.log(commentsTrain);
        const training_data = await encodeDataset(commentsTrain);
        // Convert the categorical data from bool to numeric values
        const outputData = await tf.tensor2d(toxicTrain);
        // Encode the testing data
        const testing_data = await encodeDataset(commentsTest);
        updateStatus('Status: Training the model.', 'status-train');
        // Train the model
        await model.fit(training_data, outputData, {batchSize: 32, epochs: 200, callbacks: {onBatchEnd}});
        updateStatus('Status: Building complete.', 'status-train');
        // Predict using the testing data
        model.predict(testing_data).print();
        trainedModel = model;
        // Export the model
        await model.save('downloads://toxicModel');
    } catch(err){
        console.log(err);
    }
};

function updateStatus(status, id='status'){
    // Update the status bar, revert after 3 seconds
    document.getElementById(id).innerText = status;

    setTimeout(function(){ document.getElementById(id).innerText = "Status: "; }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    let modelBuilder = document.getElementById('train-model');
    let filterTweets = document.getElementById('filter-tweets');

    modelBuilder.addEventListener('click', function(){
        const trainingData = document.getElementById('training-data').files[0];
        const testingData = document.getElementById('testing-data').files[0];
        const frTrain = new FileReader();
        const frTest = new FileReader();

        frTrain.addEventListener("load", e => {
            let train = JSON.parse(e.target.result);
            let trainToxic = train.map(comment => [
                comment.toxic === true ? 1 : 0,
                comment.toxic === false ? 1 : 0,
            ]);
            frTest.addEventListener("load", e => {
                let test = JSON.parse(e.target.result);
                // Build and train the model
                const model = buildModel();
                trainModel(model, train, trainToxic, test);
            });

            frTest.readAsText(testingData);
        });

        frTrain.readAsText(trainingData);
    });

    filterTweets.addEventListener('click', function(){
        updateStatus('Status: Filtering tweets.', 'status-predict');
        let modelLink = document.getElementById('model-link').value;
        if (trainedModel || modelLink)
        {
            chrome.tabs.executeScript(null, {
                code: "var model = " + "'" + trainedModel + "';" +
                    "var modelLink = " + "'" + modelLink + "';"
            }, function() {
                chrome.tabs.executeScript(null, {file: 'src/twitter.js'});
            });
        } else{
            updateStatus('Status: No model set.', 'status-predict');
        }
    });
});
