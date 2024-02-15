import React, { useState } from 'react';
import axios from 'axios';

const App: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [audioSrc, setAudioSrc] = useState('');
    const [error, setError] = useState('');
    const url = "https://sc-demo-otkk.onrender.com/";

    const fetchWavFile = async () => {
        try {
            const response = await axios.post(url + "embed", { text: inputText }, { responseType: 'blob' });
            const audioUrl = URL.createObjectURL(response.data);
            setAudioSrc(audioUrl);
            saveAudioFile(audioUrl);
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

    const saveAudioFile = (audioUrl: string) => {
        const link = document.createElement('a');
        link.href = audioUrl;
        link.download = 'stego.wav';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <div>SC demo test</div>
            <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} />
            <button onClick={fetchWavFile}>Embed</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {audioSrc && <audio src={audioSrc} controls />}
        </div>
    );
}

export default App;
