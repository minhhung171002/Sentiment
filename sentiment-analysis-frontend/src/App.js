import React, { useState } from 'react';
import './App.css';

function App() {
  const [tweet, setTweet] = useState('');  // State for the tweet input
  const [result, setResult] = useState('');  // State for displaying the prediction result
  const [loading, setLoading] = useState(false);  // State to indicate loading status

  // Handle the input change for the tweet text area
  const handleInputChange = (e) => {
    setTweet(e.target.value);
  };

  // Function to send the tweet to the backend and get the prediction
  const getSentiment = async () => {
    setLoading(true);  // Set loading state to true
    setResult('');  // Clear previous results

    // Check if the tweet is empty
    if (!tweet.trim()) {
      setResult('Please enter a tweet.');
      setLoading(false);
      return;
    }

    try {
      // Send POST request to the backend with the tweet
      const response = await fetch('http://localhost:3000/predict-nn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tweet }),  // Send tweet as JSON
      });

      // Parse the JSON response
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();

      // Extract the prediction (which is an object with keys like "0", "1", etc.)
      const prediction = data.prediction;
      
      // Convert prediction object to an array of values
      const predictionValues = Object.values(prediction);

      // Find the index of the highest prediction (assuming it's a classification task)
      const maxIndex = predictionValues.indexOf(Math.max(...predictionValues));

      // Display the result based on the index of the max value
      const sentimentLabels = ['Very Negative', 'Negative', 'Neutral', 'Positive', 'Very Positive'];  // Adjust labels as needed
      setResult(`Sentiment: ${sentimentLabels[maxIndex]} (Score: ${predictionValues[maxIndex].toFixed(2)})`);
      
    } catch (error) {
      console.error('Error fetching sentiment:', error);
      setResult('Error fetching sentiment.');
    } finally {
      setLoading(false);  // Set loading state to false
    }
  };

  return (
    <div className="container">
      <h2>COVID-19 Tweet Sentiment Analysis</h2>
      <textarea
        value={tweet}
        onChange={handleInputChange}
        placeholder="Enter tweet here..."
        rows="4"
        className="tweet-input"
      ></textarea>
      <button onClick={getSentiment} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze Sentiment'}
      </button>
      <div className="result">{result}</div>
    </div>
  );
}

export default App;
