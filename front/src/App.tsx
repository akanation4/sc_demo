import React, { useState } from 'react';
import axios from 'axios';

interface DataResponse {
    Hello?: string;
}

const App: React.FC = () => {
    const [data, setData] = useState<DataResponse | null>(null);
    const [inputText, setInputText] = useState('');
    const url = "https://sc-demo-otkk.onrender.com/modify";

    const SendData = () => {
        axios.post<DataResponse>(url, { text: inputText }).then((res) => {
            setData(res.data);
        });
    };

    return (
        <div>
            <div>SC demo test</div>
            <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} />
            {data ? <div>{data.Hello}</div> : <button onClick={SendData}>Send</button>}
        </div>
    );
}

export default App;
