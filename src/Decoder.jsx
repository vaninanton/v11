import { useState } from "react";

function Decoder() {
    const [result, setResult] = useState();
    const [input, setInput] = useState();

    function decode() {
        // let result = toHex(input);
        // let result = parseInt(input, 16);
        // let result = '0x'+(new Number(input)).toString(16).toUpperCase()
        let result = new Uint8Array(input.match(/[\da-f]{2}/gi).map((h) => parseInt(h, 16)))
        setResult(result);
    }

    function toHex(d) {
        return  ("0"+(Number(d).toString(16))).slice(-2).toUpperCase()
    }
    
    return (
        <div className="row my-3 border py-2">
            <div className="col">
                <div className="input-group">
                    <input type="text" className="form-control" value={input} onChange={(event) => setInput(event.target.value)} />
                    <button className="btn btn-primary" onClick={decode}>decode</button>
                </div>
            </div>
            <div className="col">
                <code>{result}</code>
            </div>
        </div>
    );
}

export default Decoder;