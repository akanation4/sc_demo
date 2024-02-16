import React, { useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const url = "https://sc-demo-otkk.onrender.com/";

const Rec: React.FC = () => {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
    const [detectedText, setDetectedText] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const toggleRecording = () => {
        if (!isRecording) {
            navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const recorder = new MediaRecorder(stream);
                setMediaRecorder(recorder);

                recorder.ondataavailable = (e: BlobEvent) => {
                    setAudioChunks(currentCunks => [...currentCunks, e.data]);
                };

                recorder.start();
                setIsRecording(true);
            })
            .catch(error => {
                console.error("録音を開始できませんでした", error)
                setError("録音を開始できませんでした");
            });
        } else {
            if (mediaRecorder) {
                mediaRecorder.stop();
                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    const formData = new FormData();
                    formData.append('file', audioBlob, 'recording.wav');

                    try {
                        const response = await axios.post(url + "detect", formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            }
                        });
                        const data = response.data;
                        console.log("音声ファイルが送信されました", data);  
                        if (data.detected) {
                            setDetectedText(data.detected);
                        }
                    } catch (error) {
                        console.error("音声ファイルの送信に失敗しました", error);
                        if (error.response && error.response.data && error.response.data.detail) {
                            setError(`音声ファイルの送信に失敗しました: ${error.response.data.detail}`);
                        } else {    
                            setError("音声ファイルの送信に失敗しました");
                        }
                    }
    
                    setIsRecording(false);
                    setAudioChunks([]);
                }
            }
        }
    };

    return (
        <div>
            <h2>Rec</h2>
            <button onClick={toggleRecording}>
                {isRecording ? "Stop" : "Start"}
            </button>
            <Link to="/play">Play</Link>
            {detectedText && <p>Detected: {detectedText}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

const Play = () => {
    const [inputText, setInputText] = useState('');
    const [audioSrc, setAudioSrc] = useState('');
    const [error, setError] = useState('');

    const fetchWavFile = async () => {
        try {
            const response = await axios.post(url + "embed", { text: inputText }, { responseType: 'blob' });
            const audioUrl = URL.createObjectURL(response.data);
            setAudioSrc(audioUrl);
            setError('');
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.data) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const jsonResponce = JSON.parse(reader.result as string);
                        setError(jsonResponce.detail || "エラーの詳細がありません");
                    } catch (e) {
                        setError("エラー応答の解析に失敗しました");
                    }
                };
                reader.onerror = () => {
                    setError("エラーメッセージの読み取りに失敗しました");
                };
                reader.readAsText(error.response.data);
            } else {
                setError("ネットワークエラーまたは未知のエラー");
            }
            console.error(error);
        }
    };

    return (
        <div>
            <h2>Play</h2>
            <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} />
            <button onClick={fetchWavFile}>Embed</button>
            <br></br>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {audioSrc && <audio src={audioSrc} controls />}
            <Link to="/rec">Rec</Link>
        </div>
    );
}

const App: React.FC = () => {
    return (
            <Router>
                <div>
                    <div>SC demo test</div>
                    <Routes>
                        <Route path="/" element={<Rec />} />
                        <Route path="/rec" element={<Rec />} />
                        <Route path="/play" element={<Play />} />
                    </Routes>
                </div>
            </Router>
    );
}

export default App;
