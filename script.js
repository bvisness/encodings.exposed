const decimalInput = document.querySelector("#decimal");
const le64 = document.querySelector("#le64");
const be64 = document.querySelector("#be64");
const uleb128 = document.querySelector("#uleb128");
const sleb128 = document.querySelector("#sleb128");

const byte = makeTemplateCloner("byte");
const byteRow = makeTemplateCloner("byteRow");

function makebyte(onchange) {
    const b = byte();
    const input = b.root.querySelector(".byte-input");
    const display = b.root.querySelector(".byte-hex");
    b.root.addEventListener("click", e => {
        input.focus();
    });
    input.addEventListener("focus", () => {
        input.value = display.innerText;
        input.classList.add("show");
    });
    input.addEventListener("blur", () => {
        let val = input.value;
        if (val.match(/^[0-9a-fA-F]*$/)) {
            const n = fromhex(val);
            display.innerText = tohex(n);
        }
        input.classList.remove("show");
    });
    input.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            input.value = display.innerText;
            input.blur();
        } else if (e.key === "Enter") {
            input.blur();
            onchange();
        }
    });
    return b;
}

// init le64
{
    const row = byteRow();
    for (let i = 0; i < 8; i++) {
        const b = makebyte(updateFromLE64);
        row.root.appendChild(b.root);
    }
    le64.appendChild(row.root);
}
// init be64
{
    const row = byteRow();
    for (let i = 0; i < 8; i++) {
        const b = makebyte(updateFromBE64);
        row.root.appendChild(b.root);
    }
    be64.appendChild(row.root);
}
// init uleb128
{
    for (let i = 0; i < 2; i++) {
        const row = byteRow();
        for (let i = 0; i < 8; i++) {
            const b = makebyte(updateFromULEB128);
            row.root.appendChild(b.root);
        }
        uleb128.appendChild(row.root);
    }
    uleb128.appendChild(E("div", ["leb-preview", "pt3"]));
}
// init sleb128
{
    for (let i = 0; i < 2; i++) {
        const row = byteRow();
        for (let i = 0; i < 8; i++) {
            const b = makebyte(updateFromSLEB128);
            row.root.appendChild(b.root);
        }
        sleb128.appendChild(row.root);
    }
    sleb128.appendChild(E("div", ["leb-preview", "pt3"]));
}

function update(num) {
    decimalInput.value = num.toString();

    // Update le64
    {
        const byteEls = Array.from(le64.querySelectorAll(".byte"));
        const bytes = encodeLE64(num);
        for (let i = 0; i < 8; i++) {
            const el = byteEls[i];
            const hex = el.querySelector(".byte-hex");
            const tooltip = el.querySelector(".byte-tooltip");

            tooltip.innerHTML = "";
            hex.innerText = tohex(bytes[i]);
            for (let index = 7; index >= 0; index--) {
                tooltip.appendChild(Bit(bytes[i], index));
            }
        }
    }
    // Update be64
    {
        const byteEls = Array.from(be64.querySelectorAll(".byte"));
        const bytes = encodeBE64(num);
        for (let i = 0; i < 8; i++) {
            const el = byteEls[i];
            const hex = el.querySelector(".byte-hex");
            const tooltip = el.querySelector(".byte-tooltip");

            tooltip.innerHTML = "";
            hex.innerText = tohex(bytes[i]);
            for (let index = 7; index >= 0; index--) {
                tooltip.appendChild(Bit(bytes[i], index));
            }
        }
    }
    // Update uleb128
    {
        const byteEls = Array.from(uleb128.querySelectorAll(".byte"));
        const bytes = encodeULEB128(num);
        for (let i = 0; i < byteEls.length; i++) {
            const el = byteEls[i];
            const hex = el.querySelector(".byte-hex");
            const tooltip = el.querySelector(".byte-tooltip");

            hex.innerText = tohex(bytes[i] ?? 0);
            el.classList.toggle("unused", i >= bytes.length);

            tooltip.innerHTML = "";
            tooltip.appendChild(E("span", ["pr2"], Bit(bytes[i], 7)));
            for (let index = 6; index >= 0; index--) {
                tooltip.appendChild(Bit(bytes[i], index));
            }
        }

        const preview = uleb128.querySelector(".leb-preview");
        const contentBytes = bytes.map(b => b & 0x7F);
        preview.innerHTML = "";
        for (let i = contentBytes.length - 1; i >= 0; i--) {
            for (let bi = 6; bi >= 0; bi--) {
                preview.appendChild(F([Bit(contentBytes[i], bi), "\u200b"]));
            }
        }
    }
    // Update sleb128
    {
        const byteEls = Array.from(sleb128.querySelectorAll(".byte"));
        const bytes = encodeSLEB128(num);
        for (let i = 0; i < byteEls.length; i++) {
            const el = byteEls[i];
            const hex = el.querySelector(".byte-hex");
            const tooltip = el.querySelector(".byte-tooltip");

            hex.innerText = tohex(bytes[i] ?? 0);
            el.classList.toggle("unused", i >= bytes.length);

            tooltip.innerHTML = "";
            tooltip.appendChild(E("span", ["pr2"], Bit(bytes[i], 7)));
            for (let index = 6; index >= 0; index--) {
                tooltip.appendChild(Bit(bytes[i], index));
            }
        }

        const preview = sleb128.querySelector(".leb-preview");
        const contentBytes = bytes.map(b => b & 0x7F);
        preview.innerHTML = "";
        for (let i = contentBytes.length - 1; i >= 0; i--) {
            for (let bi = 6; bi >= 0; bi--) {
                preview.appendChild(F([Bit(contentBytes[i], bi), "\u200b"]));
            }
        }
    }
}

function updateFromLE64() {
    const bytes = getBytes(le64);
    const n = decodeLE64(bytes);
    update(n);
}

function updateFromBE64() {
    const bytes = getBytes(be64);
    const n = decodeBE64(bytes);
    update(n);
}

function updateFromULEB128() {
    const bytes = getBytes(uleb128);
    const n = decodeULEB128(bytes);
    update(n);
}

function updateFromSLEB128() {
    const bytes = getBytes(sleb128);
    const n = decodeSLEB128(bytes);
    update(n);
}

function getBytes(el) {
    const byteEls = Array.from(el.querySelectorAll(".byte"));
    return byteEls.map(el => fromhex(el.querySelector(".byte-hex").innerText));
}

function encodeLE64(num) {
    // TODO: handle signed numbers
    return [
        Number((num >> 0n)  & 0xFFn),
        Number((num >> 8n)  & 0xFFn),
        Number((num >> 16n) & 0xFFn),
        Number((num >> 24n) & 0xFFn),
        Number((num >> 32n) & 0xFFn),
        Number((num >> 40n) & 0xFFn),
        Number((num >> 48n) & 0xFFn),
        Number((num >> 56n) & 0xFFn),
    ];
}

function decodeLE64(bytes) {
    return (
        (BigInt(bytes[0]) << 0n)
        + (BigInt(bytes[1]) << 8n)
        + (BigInt(bytes[2]) << 16n)
        + (BigInt(bytes[3]) << 24n)
        + (BigInt(bytes[4]) << 32n)
        + (BigInt(bytes[5]) << 40n)
        + (BigInt(bytes[6]) << 48n)
        + (BigInt(bytes[7]) << 56n)
    );
}

function encodeBE64(num) {
    // TODO: handle signed numbers
    return [
        Number((num >> 56n) & 0xFFn),
        Number((num >> 48n) & 0xFFn),
        Number((num >> 40n) & 0xFFn),
        Number((num >> 32n) & 0xFFn),
        Number((num >> 24n) & 0xFFn),
        Number((num >> 16n) & 0xFFn),
        Number((num >> 8n)  & 0xFFn),
        Number((num >> 0n)  & 0xFFn),
    ];
}

function decodeBE64(bytes) {
    return (
        (BigInt(bytes[0]) << 56n)
        + (BigInt(bytes[1]) << 48n)
        + (BigInt(bytes[2]) << 40n)
        + (BigInt(bytes[3]) << 32n)
        + (BigInt(bytes[4]) << 24n)
        + (BigInt(bytes[5]) << 16n)
        + (BigInt(bytes[6]) << 8n)
        + (BigInt(bytes[7]) << 0n)
    );
}

function encodeULEB128(num) {
    if (num < 0) {
        return [];
    }

    const result = [];
    do {
        let byte = num & 0x7Fn;
        num >>= 7n;
        if (num !== 0n) {
            byte |= 0x80n;
        }
        result.push(Number(byte));
    } while (num !== 0n);
    return result;
}

function decodeULEB128(bytes) {
    const bigBytes = bytes.map(b => BigInt(b));

    let n = 0n;
    let shift = 0n;
    for (const byte of bigBytes) {
        n |= (byte & 0x7Fn) << shift;
        if ((byte & 0x80n) === 0n) {
            break;
        }
        shift += 7n;
    }

    return n;
}

function encodeSLEB128(num) {
    const result = [];

    for (let i = 0; i < 100; i++) {
        let byte = num & 0x7Fn;
        num >>= 7n;

        if (
            (num === 0n && (byte & 0x40n) === 0n)
            || (num === -1n && (byte & 0x40n) !== 0n)
        ) {
            result.push(Number(byte));
            return result;
        }
        result.push(Number(byte |= 0x80n));
    }

    throw new Error(`infinite loop when encoding SLEB128 ${num}`);
}

function decodeSLEB128(bytes) {
    const bigBytes = bytes.map(b => BigInt(b));

    let n = 0n;
    let shift = 0n;
    let numBytes = 0;
    for (const byte of bigBytes) {
        n |= ((byte & 0x7Fn) << shift);
        shift += 7n;
        numBytes += 1;

        if ((byte & 0x80n) === 0n) {
            break;
        }
    }

    return BigInt.asIntN(numBytes * 7, n);
}

decimalInput.addEventListener("input", () => {
    update(BigInt(decimalInput.value));
});
update(BigInt(decimalInput.value));

function tohex(n) {
    const cl = "0123456789abcdef"[(n>>0)&0xF];
    const ch = "0123456789abcdef"[(n>>4)&0xF];
    return `${ch}${cl}`;
}

const ascii2hex = new Array(127);
for (let i = 0; i <= 9; i++) {
    ascii2hex["0".charCodeAt(0) + i] = i;
}
for (let i = 10; i < 16; i++) {
    ascii2hex["a".charCodeAt(0) - 10 + i] = i;
}
for (let i = 10; i < 16; i++) {
    ascii2hex["A".charCodeAt(0) - 10 + i] = i;
}

function fromhex(s) {
    if (s.length === 0) {
        s = "00"
    } else if (s.length === 1) {
        s = "0" + s;
    }

    const nh = ascii2hex[s.charCodeAt(0)] * 16;
    const nl = ascii2hex[s.charCodeAt(1)];

    return nh + nl;
}

function editbyte(e, type) {
    e.preventDefault();
    const byte = e.target.closest(".byte");
    console.log(byte);
}

function Bit(num, index) {
    return E("span", [], [(num & (1 << index)) ? "1" : "0"]);
}