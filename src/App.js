import React, { useState } from 'react';
import axios from 'axios';
import ProgressBar from "@ramonak/react-progress-bar"; // Importing the progress bar

function App() {
    const [fileContent, setFileContent] = useState('');
    const [words, setWords] = useState([]);
    const [vocab, setVocab] = useState(null);
    const [modelStatus, setModelStatus] = useState('');
    const [progress, setProgress] = useState(0); // Progress state

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            setFileContent(e.target.result);
        };

        reader.readAsText(file);
    };

    const preprocessText = async () => {
        setProgress(20); // Update progress
        try {
            const response = await axios.post('http://localhost:5000/preprocess', { text: fileContent });
            setWords(response.data);
            setProgress(40); // Update progress
        } catch (error) {
            console.error('Error preprocessing text', error);
        }
    };

    const buildVocab = async () => {
        setProgress(60); // Update progress
        try {
            const response = await axios.post('http://localhost:5000/build_vocab', { words });
            setVocab(response.data);
            setProgress(80); // Update progress
        } catch (error) {
            console.error('Error building vocab', error);
        }
    };

    const trainModel = async () => {
        if (vocab) {
            setProgress(90); // Update progress
            try {
                const response = await axios.post('http://localhost:5000/train', {
                    vocab_size: Object.keys(vocab.vocab).length,
                    cooccurrence_matrix: vocab.cooccurrence_matrix,
                    embedding_dim: 50,
                    epochs: 100,
                    learning_rate: 0.05
                });
                setModelStatus(response.data.status);
                setProgress(100); // Update progress to complete
            } catch (error) {
                console.error('Error training model', error);
            }
        }
    };

    return (
        <div className="App">
            <h1>GloVe Model Trainer</h1>
            
            <input type="file" accept=".txt" onChange={handleFileUpload} />
            <br />
            <button onClick={preprocessText}>Preprocess Text</button>
            <br />
            {words.length > 0 && <div><strong>Tokenized Words:</strong> {words.join(', ')}</div>}
            <br />
            <button onClick={buildVocab}>Build Vocabulary</button>
            <br />
            {vocab && (
                <div>
                    <strong>Vocabulary Size:</strong> {Object.keys(vocab.vocab).length}
                    <br />
                    <strong>Co-occurrence Matrix:</strong> {JSON.stringify(vocab.cooccurrence_matrix)}
                </div>
            )}
            <br />
            <button onClick={trainModel}>Train GloVe Model</button>
            <br />
            {modelStatus && <div><strong>Status:</strong> {modelStatus}</div>}
            <br />
            <ProgressBar completed={progress} /> {/* Show progress bar */}
        </div>
    );
}

export default App;
