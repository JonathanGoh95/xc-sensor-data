import { useState } from "react"
import * as apiService from '../services/getAPI'

export default function Results(){
    const [query,setQuery] = useState('')
    const [searched,setSearched] = useState(false)
    const [results,setResults] = useState([])
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSearched(true);
        const apiData = await apiService.api(query);
        setResults(apiData || []);
    }

    if (!searched && results.length === 0){
        return(
            <form className='flex gap-10 justify-center' onSubmit={handleSubmit}>
                <label className="w-1/2 text-center">Sensor ID: </label>
                <input className='border-2 text-3xl rounded-lg w-1/2 text-center' value={query} type='text' placeholder='Input Sensor ID...' onChange={({target})=>setQuery(target.value)}></input>
                <button className='border-2 text-3xl rounded-lg pt-2 pb-2 pl-5 pr-5 cursor-pointer' type="submit">Search</button>
            </form>
    )} else{
        return(
            <>
            <div className="flex-col justify-center mt-5 text-3xl">
                {results.success === 1 && results.data.map((res)=>{
                const statusRaw = res.payload.split(":")[res.payload.split(":").length - 1].slice(25, -4);

                let statusMessage;
                if (statusRaw === "00FFFF") {
                    statusMessage = "Water Level is Normal";
                } else if (statusRaw === "FFFF00") {
                    statusMessage = "Water Level is Too High";
                } else if (statusRaw === "000000") {
                    statusMessage = "Water Level is Too Low";
                } else {
                    statusMessage = "Anomaly/Sensor Issue Detected";
                }
                <div key={res.id} className="flex-col border-2 gap-2">
                    <p>Gateway ID: {res.gateway_id}</p>
                    <p>Created At: {new Date(res.created_at).toLocaleString()}</p>
                    <p>Updated At: {new Date(res.updated_at).toLocaleString()}</p>
                    <p>Sensor Status: {statusMessage}</p>
                </div>
                })}
            </div>
            <button onClick={setSearched(false)}>Back</button>
            </>
        )
    }
}