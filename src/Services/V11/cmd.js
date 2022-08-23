import checksum from "./checksum";
import formatArrayToBytes from "./formatArrayToBytes";

// function cmd(command, val) {
//     let result = [];
//     switch (command) {
//       case "live": return [1, 4, 17];
//       case "stats": return [1, 17, 4];
//       case "drlOn": return [3, 96, 45, 1, 91];
//       case "drlOff": return [3, 96, 45, 0, 90];
//       case "lightsOn": return [3, 96, 80, 1, 38];
//       case "lightsOff": return [3, 96, 80, 0, 39];
//       case "fanOn": return [3, 96, 67, 1, 53];
//       case "fanOff": return [3, 96, 67, 0, 52];
//       case "fanQuietOn": return [3, 96, 56, 1, 78];
//       case "fanQuietOff": return [3, 96, 56, 0, 79];
//       case "liftOn": return [3, 96, 46, 1, 88];
//       case "liftOff": return [3, 96, 46, 0, 89];
//       case "lock": return [3, 96, 49, 1, 71];
//       case "unlock": return [3, 96, 49, 0, 70];
//       case "transportOn": return [3, 96, 50, 1, 68];
//       case "transportOff": return [3, 96, 50, 0, 69];
//       case "rideComfort": return [3, 96, 35, 0, 84];
//       case "rideSport": return [3, 96, 35, 1, 85];
//       case "performanceOn": return [3, 96, 36, 1, 82];
//       case "performanceOff": return [3, 96, 36, 0, 83];
//       case "remainderReal": return [3, 96, 61, 1, 75];
//       case "remainderEst": return [3, 96, 61, 0, 74];
//       case "lowBatLimitOn": return [3, 96, 55, 1, 65];
//       case "lowBatLimitOff": return [3, 96, 55, 0, 64];
//       case "usbOn": return [3, 96, 60, 1, 74];
//       case "usbOff": return [3, 96, 60, 0, 75];
//       case "loadDetectOn": return [3, 96, 54, 1, 64];
//       case "loadDetectOff": return [3, 96, 54, 0, 65];
//       case "mute": return [3, 96, 44, 0, 91];
//       case "unmute": return [3, 96, 44, 1, 90];
//       case "calibration": return [5, 96, 66, 1, 0, 1, 51];
//       case "speedLimit":
//         result = [4, 96, 33];
//         result.push((val * 100) & 0xFF);
//         result.push(((val * 100) >> 8) & 0xFF);
//         result.push(result.reduce(checksum));
//         return result;
//       case "pedalTilt":
//         result = [4, 96, 34];
//         result.push((val * 100) & 0xFF);
//         result.push(((val * 100) >> 8) & 0xFF);
//         result.push(result.reduce(checksum));
//         return result;
//       case "pedalSensitivity":
//         result = [4, 96, 37, val, 100];
//         result.push(result.reduce(checksum));
//         return result;
//       case "setBrightness":
//         result = [3, 96, 43, val];
//         result.push(result.reduce(checksum));
//         return result;
//       case "setVolume":
//         result = [3, 96, 38, val];
//         result.push(result.reduce(checksum));
//         return result;
//       case "playSound":
//         result = [3, 224, 81, 0];
//         result.push(result.reduce(checksum));
//         return result;
//       default:
//         throw new Error(`Undefined command "${command}"`);
//     }
// }

// const NoOp = 0;
// eslint-disable-next-line no-unused-vars
const FLAG_INITIAL = 0x11;
const FLAG_DEFAULT = 0x14;

const COMMAND_VERSION = 0x01;
// eslint-disable-next-line no-unused-vars
const COMMAND_INFO = 0x02;
const COMMAND_DIAGNOSTIC = 0x03;
const COMMAND_REALTIME_INFO = 0x04;
// eslint-disable-next-line no-unused-vars
const COMMAND_BATTERY_REALTIMEINFO = 0x05;
// eslint-disable-next-line no-unused-vars
const Something1Command = 0x10;
const COMMAND_TOTALSTATS = 0x11;
// eslint-disable-next-line no-unused-vars
const COMMAND_SETTINGS = 0x20;
const COMMAND_CONTROL = 0x60;

function getCommandArray(commandName, value) {
  let command = [0xAA, 0xAA];

  switch (commandName) {
    case 'carType':
      command.push(FLAG_DEFAULT);
      command.push(COMMAND_VERSION);
      command.push(COMMAND_REALTIME_INFO);
      command.push(COMMAND_TOTALSTATS);
      break;
    case 'live':
      command.push(FLAG_DEFAULT);
      command.push(COMMAND_VERSION);
      command.push(COMMAND_REALTIME_INFO);
      command.push(COMMAND_TOTALSTATS);
      break;
    case 'stats':
      command.push(FLAG_DEFAULT);
      command.push(COMMAND_VERSION);
      command.push(COMMAND_TOTALSTATS);
      command.push(COMMAND_REALTIME_INFO);
      break;
    case "drl":
      command.push(FLAG_DEFAULT);
      command.push(COMMAND_DIAGNOSTIC);
      command.push(COMMAND_CONTROL);
      command.push(0x2D);
      command.push(value);
      break;
    case "lights":
      command.push(FLAG_DEFAULT);
      command.push(COMMAND_DIAGNOSTIC);
      command.push(COMMAND_CONTROL);
      command.push(0x50);
      command.push(value);
      break;
    case "fan":
      command.push(FLAG_DEFAULT);
      command.push(COMMAND_DIAGNOSTIC);
      command.push(COMMAND_CONTROL);
      command.push(0x43);
      command.push(value);
      break;
    case "quietMode":
      command.push(FLAG_DEFAULT);
      command.push(COMMAND_DIAGNOSTIC);
      command.push(COMMAND_CONTROL);
      command.push(0x38);
      command.push(value);
      break;
    case "handleButton":
      command.push(FLAG_DEFAULT);
      command.push(COMMAND_DIAGNOSTIC);
      command.push(COMMAND_CONTROL);
      command.push(0x2E);
      command.push(value);
      break;
    case "lock":
      command.push(FLAG_DEFAULT);
      command.push(COMMAND_DIAGNOSTIC);
      command.push(COMMAND_CONTROL);
      command.push(0x31);
      command.push(value);
      break;
    case "transport":
      command.push(FLAG_DEFAULT);
      command.push(COMMAND_DIAGNOSTIC);
      command.push(COMMAND_CONTROL);
      command.push(0x32);
      command.push(value);
      break;
    case "rideComfort":
      // 0 - комфорт
      // 1 - спорт
      command.push(FLAG_DEFAULT);
      command.push(COMMAND_DIAGNOSTIC);
      command.push(COMMAND_CONTROL); // [35, 0, 84];
      command.push(0x23);
      command.push(value);
      break;
    case "fancierMode":
      command.push(FLAG_DEFAULT);
      command.push(COMMAND_DIAGNOSTIC);
      command.push(COMMAND_CONTROL); // [36, 1, 82];
      command.push(0x24);
      command.push(value);
      break;
    case "volume":
      command.push(FLAG_DEFAULT);
      command.push(COMMAND_DIAGNOSTIC);
      command.push(COMMAND_CONTROL); // [36, 1, 82];
      command.push(0x26);
      command.push(value);
      break;
    case "brightness":
      command.push(FLAG_DEFAULT);
      command.push(COMMAND_DIAGNOSTIC);
      command.push(COMMAND_CONTROL); // [36, 1, 82];
      command.push(0x2B);
      command.push((value) & 0xFF);
      break;
    case "playSound":
      // command.push('AA');
      // command.push('AA');
      command.push(54);
      command.push(85);
      command.push(20);
      command.push(4);
      command.push(60);
      command.push(51);
      command.push(18);
      command.push(1);
      // command.push(221);
      // command.push(0xDD);
      // command.push(COMMAND_CONTROL); // [36, 1, 82];
      // command.push(0x41);
      // command.push(0x18);
      // command.push(0x01);
      break;
    default:
      throw new Error(`Undefined command ${command}`);
  }

  // Добавляем чексумму
  command.push(command.reduce(checksum));
  console.log('%c⮕', 'color: #88ff00', formatArrayToBytes(command));
  
  command = new Uint8Array(command);
  // console.log('%c⮕', 'color: #88ff00', command);
  return command;
}

export default getCommandArray;
