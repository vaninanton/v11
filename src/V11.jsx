import { Backdrop } from '@alfalab/core-components/backdrop';
import { useState } from 'react';
import cmd from './Services/V11/cmd';

window.euc = {};

function V11() {
  const filters = [
    { namePrefix: 'V11-' },
    { namePrefix: 'V8-' },
  ];
  const primaryServiceUUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
  const writeCharacteristicUUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
  const readCharacteristicUUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

  const [connection, setConnection] = useState(false);
  const [, setConnected] = useState(false);
  const [volume, setVolume] = useState(3);
  const [brightness, setBrightness] = useState(5);

  const [euc, setEuc] = useState({
    device: null,
    server: null,
    primaryService: null,
    wChar: null,
    rChar: null,
  });

  /**
   * Подключение к BLE
   */
  async function connect() {
    setConnection(true);
    try {
      let device = await navigator.bluetooth.requestDevice({ filters, optionalServices: [primaryServiceUUID] });
      device.addEventListener('gattserverdisconnected', () => setConnected(false));
      // console.log('Device selected', device);

      let server = await device.gatt.connect();
      // console.log('Connectted to GATT', server);

      let primaryService = await server.getPrimaryService(primaryServiceUUID);
      // console.log('Got primaryService', primaryService);

      let wChar = await primaryService.getCharacteristic(writeCharacteristicUUID);
      let rChar = await primaryService.getCharacteristic(readCharacteristicUUID);
      // console.log('Got wChar and rChar', wChar, rChar);

      rChar.addEventListener('characteristicvaluechanged', onCharacteristicValueChanged);
      rChar.startNotifications();

      setConnected(true);
      setEuc({
        device,
        server,
        primaryService,
        wChar,
        rChar,
      });

      // WTF
      // setTimeout(() => send(cmd('live')), 2000)
      // setTimeout(() => send(cmd('stats')), 2500)

    } catch (error) {
      console.error(error);
    } finally {
      setConnection(false);
    }
  }

  /**
   * Отключение от BLE
   */
  async function disconnect() {
    if (euc.device.gatt.connected) {
      await euc.device.gatt.disconnect();
    }
    setConnected(false);
  }

  /**
   * Обработчик получения характеристики
   * @param {Event} event 
   */
  function onCharacteristicValueChanged(event) {
    console.log('%c⬅', 'color: #ff8800', event.target.value);
    parseData(event.target.value);
  }

  /**
   * Парсинг данных, поступивших из BLE
   * @param {DataView} value 
   */
  function parseData(value) {
    console.log(value, value.buffer);
    console.log('res', value.getUint32(5, true) / 100);
  }
  /**
   * Отправка данных в характеристику
   * @param Uint8Array value 
   */
  async function send(value) {
    await euc.wChar.writeValue(value);
  }

  return (
    <>
      <div style={{ zIndex: 3, position: 'relative' }}>
        <Backdrop open={connection} />
        <h1>
          Inmotion V11
          <button className="btn btn-sm btn-primary" onClick={connect}>connect</button>
          <button className="btn btn-sm btn-primary" onClick={disconnect}>disconnect</button>
        </h1>
        <>
          <div className="btn-group">
            <button className="btn btn-sm btn-primary" onClick={() => send(cmd('carType'))}>carType</button>
            <button className="btn btn-sm btn-primary" onClick={() => send(cmd('live'))}>live (74)</button>
            <button className="btn btn-sm btn-primary" onClick={() => send(cmd('stats'))}>stats (30/31)</button>
            <button className='btn btn-sm btn-danger' onClick={() => send(cmd('lights', 1))}>Включить фару</button>
            <button className='btn btn-sm btn-danger' onClick={() => send(cmd('lights', 0))}>Выключить фару</button>
            <button className='btn btn-sm btn-danger' onClick={() => send(cmd('drl', 1))}>Включить DRL</button>
            <button className='btn btn-sm btn-danger' onClick={() => send(cmd('drl', 0))}>Выключить DRL</button>
            <button className='btn btn-sm btn-danger' onClick={() => send(cmd('playSound', 81))}>beep</button>
          </div>
          <div>
            <label className="form-label">Volume ({volume})</label>
            <input
              type="range"
              className="form-range"
              min="0"
              max="100"
              step="1"
              value={volume}
              onChange={(event) => setVolume(event.target.value)}
              onMouseUp={(event) => send(cmd('volume', event.target.value))}
            />
          </div>
          <div>
            <label className="form-label">Brightness ({brightness})</label>
            <input
              type="range"
              className="form-range"
              min="0"
              max="100"
              step="1"
              value={brightness}
              onChange={(event) => setBrightness(event.target.value)}
              onMouseUp={(event) => send(cmd('brightness', event.target.value))}
            />
          </div>
        </>
      </div>
    </>
  );
}

export default V11;
