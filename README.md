# Getting started

## Prerequisites

You'll need the following tools installed in order to run the project locally:

-   Node.js v12+
-   Git Bash
-	Python v2.7 (Do not use version v3.0+)
-   Jupyter Notebook
-	Google Chrome

Once you have the prerequisites installed on your machine, you will need to check out the project locally by cloning the repo.

The next steps will involve running commands in a terminal of your choice and setting up the chrome extension:

## Install dependencies

From the root of the project run:

```shell script
npm install
```

## Data collection

Next, you'll need to choose your method of data collection, through either:

### Providing your own dataset in a csv format.

If you have already collected your own dataset or have downloaded an existing dataset, you will need to first format the csv file into the appropriate testing and training json files.

Store your dataset in the `data/` directory. **Ensure your columns feature the following headings: 'comment' for the text, 'toxic' for the filtered value (True or False).**

Next open the `CategoriseData.ipynb` file in Jupyter Notebook located in the root directory.

On line 4, modify the input to point to your dataset here:

```shell script
df = pd.read_csv('data/my_dataset_here.csv')
```

You may modify the amount of training and testing data to be exported but it is currently set to 2500 to ensure the cpu/gpu can handle it in the following step.

Run the script and verify the output is as expected. `trainingData.json` and `testingData.json` files will be exported to the `data/` directory.

###	Using the chrome extension to gather the datasets.

Alternatively, you may use the chrome extension to gather your training and testing data.

From the root of the project run:

```shell script
npm run training-mode
```

Next, open chrome://extensions/ in your Google Chrome browser and enable developer mode.

Select load unpacked and navigate to the `dist/` directory and open. Ensure the JK Filter extension is enabled.

During browsing sites, when noticing content that you might want to see or don't want to see, you can click the extension to collect data.

The method is as follows:

-	Open the extension popup.
-	Input the content you would like to add.
-	Choose from the dropdown whether you would like to filter the content or not.
-	Press the filter data button.
-	After collecting data, press one of the export buttons depending on if the data is for training or testing.
-	The downloaded data will be available in the chrome://downloads section.
-	Move the testingData.json and trainingData.json to the `data/` directory of the solution

## Train the model

Next you will be training the model using your training and testing data. From the root of the project run:

```shell script
npm run start
```
There will now be two files exported to the `data/toxicModel` folder containing the trained model and its weights.

This will take some time, if your dataset is too large you may encounter memory allocation errors.

The file is currently set to run using your gpu to maximise performance. **If you do not have a gpu or would prefer to use your cpu, you must:**
-	Open the `index.js` file in the root directory.
-	On line 1, change the line to the following:

```shell script
require('@tensorflow/tfjs-node-cpu');
```

## Upload the model

For the model to be used in the chrome extension, the trained model files collected from the last step will need to be uploaded publicly where the raw json can be accessed.

It is recommended to use Github by creating a new repo and uploading the files to the root directory.

You then need to select your model.json file and view the raw contents. Copy the URL of the raw contents. It should start with `https://raw.githubusercontent.com/`.

## Import the model into the chrome extension

Navigate to the `src/` directory and open the `twitter.js` file.

Edit line 8 to use your raw content link you copied from the previous step:

```shell script
const model = await tf.loadLayersModel('https://raw.githubusercontent.com/jibbykun/JK_tfjs_model/main/model.json');
```

In the root directory, run the following commands:

```shell script
npm run build
```

and

```shell script
npm run prediction-mode
```

Finally, you can now load up the chrome extension from the `dist/` directory in the same method as above (Navigate to chrome://extensions and set to developer mode and load unpacked).

Once you enter any page on twitter, the predictions will run every 30 seconds. This is purposely implemented to ensure performance of the browser is not affected too much as running TFJS and the Sentence Encoder can cause the browser to crash if ran too many times in a short space of time. The timeout can be modified on line 29 in the `src/twitter.js` file here:

```shell script
setTimeout(function(){predictTweet();},30000);
```

Enjoy filtering!

## FYI

-	Training and testing mode for the chrome extension can be toggled with `npm run training-mode` and `npm run prediction-mode`.
-	If `npm run build` does not work, try running `npx parcel build src/twitter.js -d dist/src/ -o twitter` instead.
-	There is an example available that uses the `covid19_tweets.csv` and `CategoriseDataExample.ipynb` if you would like to test it.
-   The `CategoriseDataExample.ipynb` file includes additional preprocessing to clean the data and create the categorical values using an existing word filter list.
