import React, { useState } from 'react';
import axios from 'axios';

interface DataResponse {
    Hello?: string;
}

const App: React.FC = () => {
    const [data, setData] = useState<DataResponse | null>(null);
    const url = "http://127.0.0.1:8000";

    const GetData = () => {
        axios.get<DataResponse>(url).then((res) => {
            setData(res.data);
        });
    };

    return (
        <div>
            <div>SC demo test!</div>
            {data ? <div>{data.Hello}</div> : <button onClick={GetData}>Get Data</button>}
        </div>
    );
}

export default App;
