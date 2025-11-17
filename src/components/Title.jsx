import exceltec from '../../images/exceltec.png'

export default function Title(){
    return(
    <div class="flex flex-col items-center justify-center font-bold italic text-5xl gap-2">
        <img class="mt-4" src={exceltec}></img>
        <h1>Domestic Water Tank (DWT) Sensor Data</h1>
    </div>
    )
}