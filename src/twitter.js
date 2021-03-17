import * as tf from '@tensorflow/tfjs';
import * as useLoader from '@tensorflow-models/universal-sentence-encoder';

const model = browser.extension.getURL("toxicModel/model.json");
const weights = browser.extension.getURL("toxicModel/weights.bin");

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
    const sentences = data.map(comment => comment.toLowerCase());
    const encodedData = initLoader(useLoader, sentences);
    return encodedData;
}

async function loadModel(node) {
    console.log('Loading model...');
    this.model = await tf.loadLayersModel(model, weights);
    console.log('Starting.');
    const input = await encodeDataset(node);
    model.predict(input).print();
}

function grabFilteredComments(){
    try
    {
        document.querySelectorAll('div.css-901oao.r-18jsvk2.r-1qd0xha.r-a023e6.r-16dba41.r-ad9z0x.r-bcqeeo.r-bnwqim.r-qvutc0').forEach(function(node) {
            loadModel(encodeDataset([node.innerText.toLowerCase()]));
        });
    }
    catch(err)
    {
        //Skip if "pagelet_ego_pane_w" div tag isn't on this page
    }
    setTimeout(function(){grabFilteredComments();},2000);
}

grabFilteredComments();
