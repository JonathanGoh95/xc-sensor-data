export default function Search({handleSubmit,query,setQuery}){
    return(
            <form className="flex flex-col md:flex-row items-center justify-center gap-4 mt-6 px-4 md:px-0" onSubmit={handleSubmit}>
                <label className="font-bold italic text-xl md:text-2xl">Enter Sensor ID: </label>
                <input className="border-2 text-lg md:text-2xl rounded-lg w-auto text-center" value={query} type='text' placeholder='Sensor ID' onChange={({target})=>setQuery(target.value)}></input>
                <button className="border-2 text-lg md:text-2xl rounded-lg pt-2 pb-2 pl-5 pr-5 cursor-pointer italic w-auto" type="submit">Search</button>
            </form>
        )
}