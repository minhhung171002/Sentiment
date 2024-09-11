const express = require('express');
const bodyParser = require('body-parser');
const ort = require('onnxruntime-node');  // ONNX runtime for Node.js

const app = express();
app.use(bodyParser.json());  // Middleware to parse JSON request bodies

let nnSession;  // Variable to store the ONNX session for the Neural Network model

// Load the ONNX Neural Network model
ort.InferenceSession.create('sentiment_classifier.onnx')
  .then((session) => {
    nnSession = session;
    console.log('ONNX Neural Network model loaded successfully.');
  })
  .catch((err) => {
    console.error('Error loading ONNX model:', err);
  });

// Route for Neural Network sentiment prediction
app.post('/predict-nn', async (req, res) => {
  const { tweet } = req.body;  // Get the tweet from the request body

  // Preprocess the tweet
  const preprocessedInput = preprocessTweet(tweet);

  // Convert the preprocessed tweet into an ONNX-compatible tensor (int64)
  const tensorInput = new ort.Tensor('int64', new BigInt64Array(preprocessedInput), [1, 50]);

  try {
    // Run the model with the input tensor
    const result = await nnSession.run({ input: tensorInput });
    const predictions = result.output.data;  // Get predictions from the output

    // Return predictions as JSON
    res.json({ prediction: predictions });
  } catch (error) {
    console.error('Error during prediction:', error);  // Log full error
    res.status(500).send('Error during prediction.');
  }
});

// Function to preprocess the tweet (tokenization, padding, truncating)
function preprocessTweet(tweet) {
  // Tokenize the tweet by splitting on spaces
  const words = tweet.toLowerCase().split(' ');

  // Map each word to an integer (you should replace this with a real tokenizer)
  let tokenized = words.map((_, index) => BigInt(index + 1));  // Example: convert to BigInt

  // Ensure the length is exactly 50 tokens
  if (tokenized.length > 50) {
    // Truncate if the tweet is longer than 50 words
    tokenized = tokenized.slice(0, 50);
  } else if (tokenized.length < 50) {
    // Pad with zeros if the tweet is shorter than 50 words
    while (tokenized.length < 50) {
      tokenized.push(0n);  // Use BigInt 0 for padding
    }
  }

  return tokenized;
}

// Start the server and listen on port 5000
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
