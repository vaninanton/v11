
// let value = event.target.value;
// let a = [];
// let b = [];
// let c = [];
// // Convert raw data bytes to hex values just for the sake of showing something.
// // In the "real" world, you'd use data.getUint8, data.getUint16 or even
// // TextDecoder to process raw data bytes.
// for (let i = 0; i < value.byteLength; i++) {
//   a.push('' + ('00' + value.getUint8(i).toString(16)).slice(-2));
//   b.push(i);
//   c.push(value.getUint8(i));
// }
// log('> ' + c.join(' '));
// log('> ' + a.join(' '));
// log('> ' + b.join('  '));

function toHex(n) {
    if (n < 16) return '0' + n.toString(16)
    return n.toString(16).toUpperCase()
}
  
export default function formatArrayToBytes(array) {
    return array.map((i)=>{
        return '0x' + toHex(i);
    }).join(' ')
}