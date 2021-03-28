require('@tensorflow/tfjs-node-gpu');
const tf = require('@tensorflow/tfjs');
global.fetch = require('node-fetch');
const useLoader = require('@tensorflow-models/universal-sentence-encoder');
const fs = require('fs');

function importJSON(path) {
    // Parse JSON files
    return JSON.parse(fs.readFileSync(path, {encoding: 'utf8'}));
}

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

async function trainModel(model) {
    try {
        console.log('Starting.');
        // Import the JSON data files
        const commentsTrain = importJSON('./data/trainingData.json');
        const commentsTest = importJSON('./data/testingData.json');
        // Encode the training data
        const training_data = await encodeDataset(commentsTrain);
        // Convert the categorical data from bool to numeric values
        const outputData = await tf.tensor2d(commentsTrain.map(comment => [
            comment.toxic === true ? 1 : 0,
            comment.toxic === false ? 1 : 0,
        ]));
        // Encode the testing data
        const testing_data = await encodeDataset(commentsTest);
        console.log('Training the model.');
        // Train the model
        await model.fit(training_data, outputData, {batchSize: 32, epochs: 200, callbacks: {onBatchEnd}});
        console.log('Training complete.');
        // Predict using the testing data
        model.predict(testing_data).print();
        // Export the model
        await model.save('file://data/toxicModel');
    } catch(err){
        console.log(err);
    }
};

// Build and train the model
const model = buildModel();
trainModel(model);
