require('@tensorflow/tfjs-node-gpu');
const tf = require('@tensorflow/tfjs');
global.fetch = require('node-fetch');
const useLoader = require('@tensorflow-models/universal-sentence-encoder');
const fs = require('fs');

function importJSON(path) {
    return JSON.parse(fs.readFileSync(path, {encoding: 'utf8'}));
}

async function initLoader(useLoader, sentences){
    console.log('Starting load');
    const use = await useLoader.load();
    console.log('Loaded Universal Sentence Encoder');
    console.log('Starting encoding');
    const embedding = await use.embed(sentences);
    console.log('Encoding complete.');
    return embedding;
}

async function encodeDataset(data){
    const sentences = data.map(comment => comment.comment.toLowerCase());
    const encodedData = initLoader(useLoader, sentences);
    return encodedData;
}

function buildModel() {
    const model = tf.sequential();

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
    console.log('Accuracy', logs.acc);
}

async function trainModel(model) {
    try {
        console.log('Starting.');
        const commentsTrain = importJSON('./data/trainingData.json');
        const commentsTest = importJSON('./data/testingData.json');
        const training_data = await encodeDataset(commentsTrain);
        const outputData = await tf.tensor2d(commentsTrain.map(comment => [
            comment.toxic === true ? 1 : 0,
            comment.toxic === false ? 1 : 0,
        ]));
        const testing_data = await encodeDataset(commentsTest);
        console.log('Training the model.');
        await model.fit(training_data, outputData, {batchSize: 32, epochs: 200, callbacks: {onBatchEnd}});
        console.log('Training complete.');
        model.predict(testing_data).print();
        await model.save('file://data/toxicModel');
    } catch(err){
        console.log(err);
    }
};

const model = buildModel();
trainModel(model);
