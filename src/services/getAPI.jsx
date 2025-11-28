import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL ?? ''

const api = async (sensorID,locationID) => {
    try{
        const query = await axios.get(`${BASE_URL}/sensor-data?sensor_id=${sensorID}00000000${locationID}&latest_first=1`);
        return query.data;
    } catch(err){
        console.log("Error fetching API Data: ", err);
        throw err;
    }
}

export {api}