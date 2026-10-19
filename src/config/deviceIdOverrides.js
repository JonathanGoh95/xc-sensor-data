// Some LoRaWAN sensors are identified by a device EUI (a long hex string) rather than the
// plain 4-digit location ID typed into the Search form. Map "sensorType + entered ID" to the
// actual device EUI the API expects here, instead of adding another if-block in Results.jsx.
//
// To add a new one: add a "sensorType": { "enteredID": "deviceEUI" } entry below.
const DEVICE_ID_OVERRIDES = {
  peopleMOKO: {
    "0001": "E8578BFFFF116096",
    "0002": "D18393FFFF84503F",
    "0003": "DDB4BEFFFF12C5D0",
    "0004": "FF68F5FFFF48098B",
  },
};

// Returns the overridden device ID for the given sensorType/paddedID pair, or paddedID
// unchanged if no override applies.
export function resolveDeviceID(sensorType, paddedID) {
  return DEVICE_ID_OVERRIDES[sensorType]?.[paddedID] ?? paddedID;
}

export default DEVICE_ID_OVERRIDES;
