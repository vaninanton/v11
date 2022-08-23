/**
 * 
 * @param {byte} check 
 * @param {int} val 
 * @returns 
 */
export default function checksum(check, val) {
    return (check ^ val) & 0xFF;
}