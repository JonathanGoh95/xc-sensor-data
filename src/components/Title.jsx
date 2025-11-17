import exceltec from '../../images/exceltec.png'

export default function Title(){
    return(
    <div class="flex flex-col items-center justify-center font-bold italic gap-2 w-full px-4">
        <img class="mt-4" src={exceltec}></img>
        <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center">Domestic Water Tank (DWT) Sensor Data</h1>
    </div>
    )
}