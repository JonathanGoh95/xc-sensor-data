import exceltec from '../../images/exceltec.png'

export default function Title(){
    return(
    <div className="flex flex-col items-center justify-center font-bold italic gap-2 w-full px-4">
        <img className="mt-4 hover:cursor-pointer" src={exceltec} onClick={()=>window.location.reload()} ></img>
    </div>
    )
}