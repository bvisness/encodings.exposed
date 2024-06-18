const decimalInput = document.querySelector("#decimal");
const le64 = document.querySelector("#le64");
const be64 = document.querySelector("#be64");

const byte = makeTemplateCloner("byte");
const byteRow = makeTemplateCloner("byteRow");

// init le64
{
    const row = byteRow();
    for (let i = 0; i < 8; i++) {
        const b = byte();
        row.root.appendChild(b.root);
    }
    le64.appendChild(row.root);
}
// init be64
{
    const row = byteRow();
    for (let i = 0; i < 8; i++) {
        const b = byte();
        row.root.appendChild(b.root);
    }
    be64.appendChild(row.root);
}

function update(num) {
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
    const cl = "0123456789abcdef"[(n>>0)%16];
    const ch = "0123456789abcdef"[(n>>4)%16];
    return `${ch}${cl}`;
}