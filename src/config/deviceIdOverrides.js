// Some LoRaWAN sensors are identified by a device EUI (a long hex string) rather than the
// plain 4-digit location ID typed into the Search form. Map "sensorType + entered ID" to the
// actual device EUI the API expects here, instead of adding another if-block in Results.jsx.
//
// To add a new one: add a "sensorType": { "enteredID": "deviceEUI" } entry below.
const DEVICE_ID_OVERRIDES = {
  peopleMOKO: {
    "0001": "E8578BFFFF116096",
  },
  vibration: {
    // 0002 is at The Warren, but not yet redeployed.
    // Will be added here once redeployment completes.
    "0001": "74FE48FFFF8B4233",
    "0003": "74FE48FFFF8B3EE0",
    "0004": "74FE48FFFF8B3E8D",
    "0007": "74FE48FFFFB21A98",
    "0008": "74FE48FFFFB1FA53",
    "0009": "74FE48FFFFB1FA68",
    "000A": "74FE48FFFFB1F988",
    "000B": "74FE48FFFFB1E8BB",
    "000C": "74FE48FFFFB1E5BF",
    "000D": "74FE48FFFFB1EA03",
    "000E": "74FE48FFFFB1FC19",
    "000F": "74FE48FFFFB21B12",
    "0010": "74FE48FFFFB1E8C0",
    "0012": "74FE48FFFFB1F7F1",
    "0013": "74FE48FFFFB0A980",
    "0014": "74FE48FFFFB1F813",
  },
};

// Returns the overridden device ID for the given sensorType/paddedID pair, or paddedID
// unchanged if no override applies.
export function resolveDeviceID(sensorType, paddedID) {
  return DEVICE_ID_OVERRIDES[sensorType]?.[paddedID] ?? paddedID;
}

export default DEVICE_ID_OVERRIDES;
