import axios from "axios";

const BASE_URL = "https://install.xciot.com.sg/api"

const api = async (sensorID) => {
    try{
        const query = await axios.get(`${BASE_URL}/sensor-data?sensor_id=${sensorID}&latest_first=1`);
        return query.data;
    } catch(err){
        console.log("Error fetching API Data: ", err);
        throw err;
    }
}

export {api}