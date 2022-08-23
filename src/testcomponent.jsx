/* eslint-disable default-case */
/* eslint-disable import/no-anonymous-default-export */

import { Button } from '@alfalab/core-components/button';
import { useState } from "react";

function checksum(check, val) {
  return (check ^ val) & 0xFF;
}

const euc = {};

export default function () {
  const [mileage, setMileage] = useState(0);
  const [voltage, setVoltage] = useState(0);

  const primaryServiceUUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
  const writeCharacteristicUUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
  const readCharacteristicUUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

  euc.cmd = function (no, val) {
    let cmd = [];
    switch (no) {
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
        cmd = [170, 170, 20, 4, 96, 33];
        cmd.push((val * 100) & 0xFF);
        cmd.push(((val * 100) >> 8) & 0xFF);
        cmd.push(cmd.reduce(checksum));
        return cmd;
      case "pedalTilt":
        cmd = [170, 170, 20, 4, 96, 34];
        cmd.push((val * 100) & 0xFF);
        cmd.push(((val * 100) >> 8) & 0xFF);
        cmd.push(cmd.reduce(checksum));
        return cmd;
      case "pedalSensitivity":
        cmd = [170, 170, 20, 4, 96, 37, val, 100];
        cmd.push(cmd.reduce(checksum));
        return cmd;
      case "setBrightness":
        cmd = [170, 170, 20, 3, 96, 43, val];
        cmd.push(cmd.reduce(checksum));
        return cmd;
      case "setVolume":
        cmd = [170, 170, 20, 3, 96, 38, val];
        cmd.push(cmd.reduce(checksum));
        return cmd;
      case "playSound":
        cmd = [170, 170, 20, 3, 224, 81, 0];
        cmd.push(cmd.reduce(checksum));
        return cmd;
    }
  }
  euc.connect = function () {
    navigator.bluetooth.requestDevice({
      filters: [{
        namePrefix: 'V11-'
      }],
      // acceptAllDevices: true,
      optionalServices: [primaryServiceUUID],
    })
      .then(device => device.gatt.connect())
      .then(server => server.getPrimaryService(primaryServiceUUID))
      .then(service => {
        euc.service = service;
        return euc.service.getCharacteristic(writeCharacteristicUUID);
      })
      .then(wCha => {
        euc.wCha = wCha;
        return euc.service.getCharacteristic(readCharacteristicUUID);
      })
      .then(function (rCha) {
        euc.rCha = rCha;
        euc.rCha.startNotifications();
        euc.rCha.addEventListener('characteristicvaluechanged', function (event) {
          console.log('responce packet: ', event.target.value);

          euc.bufferValue = event.target.value;
          if (euc.bufferValue.byteLength === 30) {
            euc.parseStatsData(euc.bufferValue);
          } else if (euc.bufferValue.byteLength === 74) {
            euc.parseLiveData(euc.bufferValue);
          } else {
            console.error('wtf', euc.bufferValue.byteLength);
          }
        });

        setInterval(() => {
          euc.send(euc.cmd("live"));
          setTimeout(() => {
            euc.send(euc.cmd("stats"));
          }, 100);
        }, 5000);

        // euc.send(euc.cmd("live"));

        return euc.rCha;
      })
      .catch(error => { console.error(error); });
  };

  euc.send = function (value) {
    euc.wCha.writeValue(new Uint8Array(value))
      .catch(error => {
        console.error(error);
      });
  };

  euc.parseStatsData = function (value) {
    setMileage(value.getInt32(5, true) / 100);
  };

  euc.parseLiveData = function (value) {
    setVoltage(value.getInt16(5, true) / 100);
  };

  euc.test = function () {
    // var arr = ['AA', 'AA', 14, 3, 60, 50, 1, 26];
    // arr.forEach((i, index) => {
    //   arr[index] = parseInt(i, 16)
    // })
    // console.log(arr);
    euc.service.getCharacteristic('6e400003-b5a3-f393-e0a9-e50e24dcca9e').then(rCha => {
      euc.rCha = rCha;
      euc.rCha.startNotifications();
      euc.rCha.oncharacteristicvaluechanged = function (event) {
        console.log('responce packet: ', event.target.value);
        setMileage(event.target.value.getUint32(5, true) / 100);
      }
    })
  }

  window.euc = euc;

  return (
    <div className="row">
      <div className="col">
        <Button
          view="primary"
          onClick={euc.connect}
        >
          Подключиться
        </Button>
      </div>
      {(euc.service) &&
        <div className="col">
          <div className="row">
            <div className="col">
              <Button block={true} size="s" onClick={() => euc.send(euc.cmd('lightsOn'))}>
                Включить фару
              </Button>
            </div>
            <div className="col">
              <Button block={true} size="s" onClick={() => euc.send(euc.cmd('lightsOff'))}>
                Выключить фару
              </Button>
            </div>
          </div>
        </div>
      }

      <div className="col">
        <div>
          {(mileage !== 0) &&
            <div>{mileage} km</div>
          }
          {(voltage !== 0) &&
            <div>{voltage.toFixed(2)} V</div>
          }
          {/* <CircularProgressBar value={84 / 100 * voltage} ></CircularProgressBar> */}
        </div>
      </div>
    </div>
  );
}
