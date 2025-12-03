import { useEffect } from 'react'

export default function Search({handleSubmit,setQuery,queryID,setQueryID,sensorType,setSensorType}){
    useEffect(() => {
        // Keep render pure: update `query` only when sensorType changes
        if (sensorType === 'dwt') setQuery('ffff')
        else if (sensorType === 'bin') setQuery('0013')
        else if (sensorType === 'ked') setQuery('0004')
        else if (sensorType === 'light') setQuery('0007')
        else if (sensorType === 'people') setQuery('0001')
        else if (sensorType === 'pH') setQuery('000B')
        else if (sensorType === 'water') setQuery('0008')
        else if (sensorType === 'soil') setQuery('0006')
        else setQuery('')
    }, [sensorType, setQuery])

    return(
            <form className="flex flex-col items-center justify-center gap-4 mt-6 px-4 md:px-0" onSubmit={handleSubmit}>
                <label className="font-bold italic text-xl md:text-2xl">Select Sensor Type: </label>
                <select className="text-xl md:text-2xl border-2 rounded-lg p-1 px-2 hover:cursor-pointer text-center" name="sensorType" value={sensorType} onChange={({target})=>setSensorType(target.value)}>
                    <option value="dwt">DWT Sensor</option>
                    <option value="bin">Bin Sensor</option>
                    <option value="ked">KED Sensor</option>
                    <option value="light">Light Sensor</option>
                    <option value="people">People Counter</option>
                    <option value="pH">pH Sensor</option>
                    <option value="water">Waterflow Sensor</option>
                    <option value="soil">Soil Sensor</option>
                </select>
                {/* <label className="font-bold italic text-xl md:text-2xl">Enter Sensor ID: </label>
                <input className="border-2 text-lg md:text-2xl rounded-lg w-auto text-center" value={query} type='text' placeholder='Sensor ID' onChange={({target})=>setQuery(target.value)} minLength={4} maxLength={4} required></input> */}
                <label className="font-bold italic text-xl md:text-2xl">Enter Location ID: </label>
                <input className="border-2 text-lg md:text-2xl rounded-lg w-auto text-center" value={queryID} type='text' placeholder='Location ID' onChange={({target})=>setQueryID((target.value))} maxLength={4} required></input>
                <button className="border-2 text-lg md:text-2xl rounded-lg pt-2 pb-2 pl-5 pr-5 cursor-pointer italic w-auto hover:cursor-pointer" type="submit">Search</button>
            </form>
        )
}