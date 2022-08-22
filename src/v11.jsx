import { useState } from 'react';

var ab2str = require('arraybuffer-to-string')

const filters = [
  { namePrefix: 'V11-' },
  { namePrefix: 'V8-' },
];
const primaryServiceUUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const writeCharacteristicUUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const readCharacteristicUUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

let device, server, primaryService, wChar, rChar;

async function connect() {
  device = await navigator.bluetooth.requestDevice({ filters, optionalServices: [primaryServiceUUID] });
  device.addEventListener('gattserverdisconnected', onDisconnected);
  // log('Device selected', device);

  server = await device.gatt.connect();
  // log('Connectted to GATT', server);

  primaryService = await server.getPrimaryService(primaryServiceUUID);
  // log('Got primaryService', primaryService);

  wChar = await primaryService.getCharacteristic(writeCharacteristicUUID);
  rChar = await primaryService.getCharacteristic(readCharacteristicUUID);
  // log('Got wChar and rChar', wChar, rChar);

  rChar.addEventListener('characteristicvaluechanged', onCharacteristicValueChanged);
  rChar.startNotifications();

  await send(cmd('live'));
  await send(cmd('stats'));
}

function log(...theArgs) {
  console.log(...theArgs);
}

function onDisconnected(event) {
  const device = event.target;
  log(`Устройство ${device.name} отключено.`);
}

function onCharacteristicValueChanged(event) {
  setVoltage()
  // log('responce packet: ', event.target.value, ab2str(event.target.value.buffer, 'hex'));
  // log('bytesToHex', bytesToHex(event.target.value));
  if (event.target.value.byteLength === 30) {
    ParseStatsData(event.target.value);
  } else if (event.target.value.byteLength === 74) {
    ParseLiveData(event.target.value);
  } else {
    console.error('wtf', event.target.value.byteLength, ab2str(event.target.value.buffer, 'hex'));
  }
}

async function send(value) {
  
  await wChar.writeValue(new Uint8Array(value));
}

function cmd(command, val) {
  let result = [];
  switch (command) {
    case "live": return [170, 170, 20, 1, 4, 17];
    case "stats": return [170, 170, 20, 1, 17, 4];
    case "drlOn": return [170, 170, 20, 3, 96, 45, 1, 91];
    case "drlOff": return [170, 170, 20, 3, 96, 45, 0, 90];
    case "lightsOn": return [170, 170, 20, 3, 96, 80, 1, 38];
    case "lightsOff": return [170, 170, 20, 3, 96, 80, 0, 39];
    case "fanOn": return [170, 170, 20, 3, 96, 67, 1, 53];
    case "fanOff": return [170, 170, 20, 3, 96, 67, 0, 52];
    case "fanQuietOn": return [170, 170, 20, 3, 96, 56, 1, 78];
    case "fanQuietOff": return [170, 170, 20, 3, 96, 56, 0, 79];
    case "liftOn": return [170, 170, 20, 3, 96, 46, 1, 88];
    case "liftOff": return [170, 170, 20, 3, 96, 46, 0, 89];
    case "lock": return [170, 170, 20, 3, 96, 49, 1, 71];
    case "unlock": return [170, 170, 20, 3, 96, 49, 0, 70];
    case "transportOn": return [170, 170, 20, 3, 96, 50, 1, 68];
    case "transportOff": return [170, 170, 20, 3, 96, 50, 0, 69];
    case "rideComfort": return [170, 170, 20, 3, 96, 35, 0, 84];
    case "rideSport": return [170, 170, 20, 3, 96, 35, 1, 85];
    case "performanceOn": return [170, 170, 20, 3, 96, 36, 1, 82];
    case "performanceOff": return [170, 170, 20, 3, 96, 36, 0, 83];
    case "remainderReal": return [170, 170, 20, 3, 96, 61, 1, 75];
    case "remainderEst": return [170, 170, 20, 3, 96, 61, 0, 74];
    case "lowBatLimitOn": return [170, 170, 20, 3, 96, 55, 1, 65];
    case "lowBatLimitOff": return [170, 170, 20, 3, 96, 55, 0, 64];
    case "usbOn": return [170, 170, 20, 3, 96, 60, 1, 74];
    case "usbOff": return [170, 170, 20, 3, 96, 60, 0, 75];
    case "loadDetectOn": return [170, 170, 20, 3, 96, 54, 1, 64];
    case "loadDetectOff": return [170, 170, 20, 3, 96, 54, 0, 65];
    case "mute": return [170, 170, 20, 3, 96, 44, 0, 91];
    case "unmute": return [170, 170, 20, 3, 96, 44, 1, 90];
    case "calibration": return [170, 170, 20, 5, 96, 66, 1, 0, 1, 51];
    case "speedLimit":
      result = [170, 170, 20, 4, 96, 33];
      result.push((val * 100) & 0xFF);
      result.push(((val * 100) >> 8) & 0xFF);
      result.push(result.reduce(checksum));
      return result;
    case "pedalTilt":
      result = [170, 170, 20, 4, 96, 34];
      result.push((val * 100) & 0xFF);
      result.push(((val * 100) >> 8) & 0xFF);
      result.push(result.reduce(checksum));
      return result;
    case "pedalSensitivity":
      result = [170, 170, 20, 4, 96, 37, val, 100];
      result.push(result.reduce(checksum));
      return result;
    case "setBrightness":
      result = [170, 170, 20, 3, 96, 43, val];
      result.push(result.reduce(checksum));
      return result;
    case "setVolume":
      result = [170, 170, 20, 3, 96, 38, val];
      result.push(result.reduce(checksum));
      return result;
    case "playSound":
      result = [170, 170, 20, 3, 224, 81, 0];
      result.push(result.reduce(checksum));
      return result;
    default:
      throw new Error(`Undefined command "${command}"`);
  }
}

function ParseStatsData(value) {
  log('mileage', value.getUint32(5, true) / 100);
}


function checksum(check, val) {
  return (check ^ val) & 0xFF;
}

function V11() {
  // const [mileage, setMileage] = useState(0);
  const [voltage, setVoltage] = useState(0);

  const ParseLiveData = (value) {
    log('voltage', value.getInt16(5, true) / 100);
  }

  return (
    <div>
      <h1>
        Inmotion V11 {voltage}
      </h1>
      <div className="btn-group">
        <button className="btn btn-primary" onClick={connect}>connect</button>
        <button className="btn btn-primary" onClick={() => send(cmd('live')) }>live</button>
        <button className="btn btn-primary" onClick={() => send(cmd('stats')) }>stats</button>
        <button className='btn btn-danger' onClick={() => send(cmd('lightsOn'))}>Включить фару</button>
        <button className='btn btn-danger' onClick={() => send(cmd('lightsOff'))}>Выключить фару</button>
      </div>
    </div>
  );
}

export default V11;
