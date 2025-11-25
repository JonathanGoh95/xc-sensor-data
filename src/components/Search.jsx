export default function Search({handleSubmit,query,setQuery,sensorType,setSensorType}){
    return(
            <form className="flex flex-col items-center justify-center gap-4 mt-6 px-4 md:px-0" onSubmit={handleSubmit}>
                <label className="font-bold italic text-xl md:text-2xl">Select Sensor Type: </label>
                <select className="text-xl md:text-2xl border-2 rounded-lg p-1 px-2 hover:cursor-pointer" name="sensorType" value={sensorType} onChange={({target})=>setSensorType(target.value)}>
                    <option value="dwt">DWT Sensor</option>
                    <option value="bin">Bin Sensor</option>
                    <option value="ked">KED Sensor</option>
                    <option value="light">Light Sensor</option>
                </select>
                <label className="font-bold italic text-xl md:text-2xl">Enter Sensor ID: </label>
                <input className="border-2 text-lg md:text-2xl rounded-lg w-auto text-center" value={query} type='text' placeholder='Sensor ID' onChange={({target})=>setQuery(target.value)}></input>
                <button className="border-2 text-lg md:text-2xl rounded-lg pt-2 pb-2 pl-5 pr-5 cursor-pointer italic w-auto hover:cursor-pointer" type="submit">Search</button>
            </form>
        )
}