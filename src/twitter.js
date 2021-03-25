require('regenerator-runtime/runtime');
const tf = require('@tensorflow/tfjs');
const useLoader = require('@tensorflow-models/universal-sentence-encoder');

async function predictToxic(){
    try {
        const model = await tf.loadLayersModel('https://github.coventry.ac.uk/raw/keyanij/JK_tfjs_model/master/model.json');
        console.log('Starting load');
        const use = await useLoader.load();
        console.log('Loaded Universal Sentence Encoder');
        document.querySelectorAll('div.css-901oao.r-18jsvk2.r-1qd0xha.r-a023e6.r-16dba41.r-rjixqe.r-bcqeeo.r-bnwqim.r-qvutc0').forEach(async function(node) {
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
    } catch (err){
        console.log(err);
    }
}

setTimeout(function(){predictToxic();},10000);
