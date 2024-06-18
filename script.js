const decimalInput = document.querySelector("#decimal");
const le64 = document.querySelector("#le64");
const be64 = document.querySelector("#be64");

const byte = makeTemplateCloner("byte");
const byteRow = makeTemplateCloner("byteRow");

function makebyte(onchange) {
    const b = byte();
    const input = b.root.querySelector(".byte-input");
    const display = b.root.querySelector(".byte-hex");
    b.root.addEventListener("click", e => {
        input.value = display.innerText;
        input.classList.add("show");
        input.focus();
    });
    input.addEventListener("blur", () => {
        let val = input.value;
        if (val.match(/^[0-9a-fA-F]*$/)) {
            const n = fromhex(val);
            display.innerText = hex(n);
            onchange();
        }
        input.classList.remove("show");
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

function update(num) {
    decimalInput.value = num.toString();

    // Update le64
    {
        const byteEls = Array.from(le64.querySelectorAll(".byte"));
        const bytes = encodeLE64(num);
        for (let i = 0; i < 8; i++) {
            byteEls[i].querySelector(".byte-hex").innerText = hex(bytes[i]);
        }
    }
    // Update be64
    {
        const byteEls = Array.from(be64.querySelectorAll(".byte"));
        const bytes = encodeBE64(num);
        for (let i = 0; i < 8; i++) {
            byteEls[i].querySelector(".byte-hex").innerText = hex(bytes[i]);
        }
    }
}

function updateFromLE64() {
    const bytes = getBytes(le64);
    const n = (
        (BigInt(bytes[0]) << 0n)
        + (BigInt(bytes[1]) << 8n)
        + (BigInt(bytes[2]) << 16n)
        + (BigInt(bytes[3]) << 24n)
        + (BigInt(bytes[4]) << 32n)
        + (BigInt(bytes[5]) << 40n)
        + (BigInt(bytes[6]) << 48n)
        + (BigInt(bytes[7]) << 56n)
    );
    update(n);
}

function updateFromBE64() {
    const bytes = getBytes(be64);
    const n = (
        (BigInt(bytes[0]) << 56n)
        + (BigInt(bytes[1]) << 48n)
        + (BigInt(bytes[2]) << 40n)
        + (BigInt(bytes[3]) << 32n)
        + (BigInt(bytes[4]) << 24n)
        + (BigInt(bytes[5]) << 16n)
        + (BigInt(bytes[6]) << 8n)
        + (BigInt(bytes[7]) << 0n)
    );
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

decimalInput.addEventListener("input", () => {
    update(BigInt(decimalInput.value));
});
update(BigInt(decimalInput.value));

function hex(n) {
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
