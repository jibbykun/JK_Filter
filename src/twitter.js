require('regenerator-runtime/runtime');
const tf = require('@tensorflow/tfjs');
const useLoader = require('@tensorflow-models/universal-sentence-encoder');

async function predictToxic(){
    try {
        // Load the tjfs model
        if (modelLink !== "")
            model = await tf.loadLayersModel(modelLink);
        console.log(model);
        console.log('Starting load');
        // Load the universal sentence encoder
        const use = await useLoader.load();
        console.log('Loaded Universal Sentence Encoder');
        function predictContent() {
            // Run for loop against each tweet on the page
            document.querySelectorAll('div.css-901oao.r-18jsvk2.r-1qd0xha.r-a023e6.r-16dba41.r-rjixqe.r-bcqeeo.r-bnwqim.r-qvutc0').forEach(async function (node) {
                // Encode the tweet and make the prediction
                console.log('Starting encoding');
                const embedding = await use.embed(node.innerText.toLowerCase());
                console.log('Encoding complete.');
                const toxic = tf.tensor([0.9]);
                const prediction = model.predict(embedding);
                prediction.print();
                const result = prediction.greaterEqual(toxic);
                const arrResult = Array.from(result.dataSync());
                if (arrResult[0] === 1)
                    node.innerText = "";
            });
            // Repeat the for loop every 30 seconds
            setTimeout(function(){predictContent();},30000);
        }
        predictContent();
    } catch (err){
        console.log(err);
    }
}

predictToxic();


