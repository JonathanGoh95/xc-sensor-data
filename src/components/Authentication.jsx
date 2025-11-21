import { useState } from "react"
import Results from "./Results"

export default function Authentication(){
    const [submitted,setSubmitted] = useState(false)
    const [authenticated,setAuthenticated] = useState(false)
    const [pass,setPass] = useState('')
    const [error, setError] = useState('')
    const [showPass, setShowPass] = useState(false)
    // Vite exposes only env vars prefixed with VITE_ to client code
    const xcPass = import.meta.env.VITE_XC_ADMIN_PASS ?? ''
    
    const handleAuth = (e) => {
        e.preventDefault()
        setSubmitted(true)
        if (pass.trim() === (xcPass ?? '').trim()){
            setAuthenticated(true)
            setError('')
        } else{
            setAuthenticated(false)
            setError('Wrong Password Entered.')
        }
    }

    const handleBack = () => {
        setSubmitted(false)
        setPass('')
        setError('')
        setAuthenticated(false)
    }

    if (!authenticated && !submitted){
        return(
            <form className="w-full md:w-1/2 mx-auto flex flex-col items-center justify-center gap-4 mt-6 px-4 md:px-0" onSubmit={handleAuth}>
                <label className="font-bold italic text-2xl md:text-3xl">Enter Password: </label>
                <div className="flex items-center gap-2">
                    <input
                        className="border-2 text-lg md:text-2xl rounded-lg w-full text-center py-1"
                        value={pass}
                        type={showPass ? 'text' : 'password'}
                        placeholder='XC Password'
                        onChange={({target})=>setPass(target.value)}
                    />
                    <button
                        type="button"
                        aria-pressed={showPass}
                        onClick={() => setShowPass((s) => !s)}
                        className="border-2 px-3 py-1 rounded-lg text-lg md:text-2xl"
                    >
                        {showPass ? 'Hide' : 'Show'}
                    </button>
                </div>
                <button className="border-2 text-lg md:text-2xl rounded-lg pt-2 pb-2 pl-5 pr-5 cursor-pointer italic w-auto" type="submit">Submit</button>
            </form>
        )
    }

    if (submitted && !authenticated){
        return (
            <div className="flex flex-col items-center gap-4 mt-6">
                <p className="text-center text-lg md:text-2xl">{error || 'Wrong Password Entered.'}</p>
                <button className="border px-3 py-1 rounded text-lg md:text-2xl w-auto mt-2 hover:cursor-pointer" onClick={handleBack}>Back</button>
            </div>
        )
    }

    if (authenticated && submitted){
        return <Results />
    }
}