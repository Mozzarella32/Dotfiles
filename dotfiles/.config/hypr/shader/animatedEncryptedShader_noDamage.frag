#version 320 es

precision mediump float;
precision mediump int;
in vec2 v_texcoord;
uniform sampler2D tex;
uniform vec2 screen_size;

uniform float time;

out vec4 fragColor;

#define M_PI 3.1415926535897932384626433832795

// AES encryption of the sampled color using 'time' as the key material.
// Key derivation: we derive four 32-bit words from the float 'time' via
// floatBitsToUint(time + offsets). These four words form the 128-bit AES key.
// We then AES-128-encrypt a single 16-byte block whose first 3 bytes are the
// RGB channels (0..255) and the remaining bytes are padding. The encrypted
// bytes are written back to fragColor.rgb (normalized to 0..1).
//
// Notes / caveats:
// - This implements AES-128 (correct AES S-box, key expansion, rounds).
// - Using a raw float->bits-derived key is generally not cryptographically
//   strong for real security use; this is intended per your request.
// - Implementing crypto in shaders has many practical pitfalls (precision,
//   side-channels) — use only for experiments where you understand the risks.

//
// Helper: AES S-box (standard Rijndael S-box)
//
const uint sbox[256] = uint[256](
    0x63u,0x7cu,0x77u,0x7bu,0xf2u,0x6bu,0x6fu,0xc5u,0x30u,0x01u,0x67u,0x2bu,0xfeu,0xd7u,0xabu,0x76u,
    0xcau,0x82u,0xc9u,0x7du,0xfau,0x59u,0x47u,0xf0u,0xadu,0xd4u,0xa2u,0xafu,0x9cu,0xa4u,0x72u,0xc0u,
    0xb7u,0xfdu,0x93u,0x26u,0x36u,0x3fu,0xf7u,0xccu,0x34u,0xa5u,0xe5u,0xf1u,0x71u,0xd8u,0x31u,0x15u,
    0x04u,0xc7u,0x23u,0xc3u,0x18u,0x96u,0x05u,0x9au,0x07u,0x12u,0x80u,0xe2u,0xebu,0x27u,0xb2u,0x75u,
    0x09u,0x83u,0x2cu,0x1au,0x1bu,0x6eu,0x5au,0xa0u,0x52u,0x3bu,0xd6u,0xb3u,0x29u,0xe3u,0x2fu,0x84u,
    0x53u,0xd1u,0x00u,0xedu,0x20u,0xfcu,0xb1u,0x5bu,0x6au,0xcbu,0xbeu,0x39u,0x4au,0x4cu,0x58u,0xcfu,
    0xd0u,0xefu,0xaau,0xfbu,0x43u,0x4du,0x33u,0x85u,0x45u,0xf9u,0x02u,0x7fu,0x50u,0x3cu,0x9fu,0xa8u,
    0x51u,0xa3u,0x40u,0x8fu,0x92u,0x9du,0x38u,0xf5u,0xbcu,0xb6u,0xdau,0x21u,0x10u,0xffu,0xf3u,0xd2u,
    0xcdu,0x0cu,0x13u,0xecu,0x5fu,0x97u,0x44u,0x17u,0xc4u,0xa7u,0x7eu,0x3du,0x64u,0x5du,0x19u,0x73u,
    0x60u,0x81u,0x4fu,0xdcu,0x22u,0x2au,0x90u,0x88u,0x46u,0xeeu,0xb8u,0x14u,0xdeu,0x5eu,0x0bu,0xdbu,
    0xe0u,0x32u,0x3au,0x0au,0x49u,0x06u,0x24u,0x5cu,0xc2u,0xd3u,0xacu,0x62u,0x91u,0x95u,0xe4u,0x79u,
    0xe7u,0xc8u,0x37u,0x6du,0x8du,0xd5u,0x4eu,0xa9u,0x6cu,0x56u,0xf4u,0xeau,0x65u,0x7au,0xaeu,0x08u,
    0xbau,0x78u,0x25u,0x2eu,0x1cu,0xa6u,0xb4u,0xc6u,0xe8u,0xddu,0x74u,0x1fu,0x4bu,0xbdu,0x8bu,0x8au,
    0x70u,0x3eu,0xb5u,0x66u,0x48u,0x03u,0xf6u,0x0eu,0x61u,0x35u,0x57u,0xb9u,0x86u,0xc1u,0x1du,0x9eu,
    0xe1u,0xf8u,0x98u,0x11u,0x69u,0xd9u,0x8eu,0x94u,0x9bu,0x1eu,0x87u,0xe9u,0xceu,0x55u,0x28u,0xdfu,
    0x8cu,0xa1u,0x89u,0x0du,0xbfu,0xe6u,0x42u,0x68u,0x41u,0x99u,0x2du,0x0fu,0xb0u,0x54u,0xbbu,0x16u
);

// Rcon for key expansion
const uint rcon[10] = uint[10](0x01u,0x02u,0x04u,0x08u,0x10u,0x20u,0x40u,0x80u,0x1Bu,0x36u);

// Multiply in GF(2^8)
uint xtime(uint x) {
    x &= 0xFFu;
    uint res = (x << 1) & 0xFFu;
    // if high bit was set, xor with 0x1B
    if ((x & 0x80u) != 0u) {
        res ^= 0x1Bu;
    }
    return res & 0xFFu;
}

uint gmul(uint a, uint b) {
    // Russian peasant multiplication in GF(2^8)
    uint aa = a & 0xFFu;
    uint bb = b & 0xFFu;
    uint res = 0u;
    for (int i = 0; i < 8; ++i) {
        if ((bb & 1u) != 0u) {
            res ^= aa;
        }
        uint hi = aa & 0x80u;
        aa = (aa << 1) & 0xFFu;
        if (hi != 0u) aa ^= 0x1Bu;
        bb >>= 1;
    }
    return res & 0xFFu;
}

// SubWord: apply sbox to each byte of a 32-bit word
uint SubWord(uint w) {
    uint b0 = sbox[(w >> 24) & 0xFFu];
    uint b1 = sbox[(w >> 16) & 0xFFu];
    uint b2 = sbox[(w >> 8) & 0xFFu];
    uint b3 = sbox[w & 0xFFu];
    return (b0 << 24) | (b1 << 16) | (b2 << 8) | b3;
}

// RotWord: rotate left by 8 bits (one byte)
uint RotWord(uint w) {
    return ((w << 8) | (w >> 24)) & 0xFFFFFFFFu;
}

// Expand key: input 16 bytes (4 words) -> 44 words (176 bytes)
void KeyExpansion(const uint keyWords0[4], out uint roundKeys[44]) {
    // copy first 4 words
    for (int i = 0; i < 4; ++i) roundKeys[i] = keyWords0[i];

    for (int i = 4; i < 44; ++i) {
        uint temp = roundKeys[i - 1];
        if (i % 4 == 0) {
            temp = SubWord(RotWord(temp)) ^ (rcon[(i / 4) - 1] << 24);
        }
        roundKeys[i] = roundKeys[i - 4] ^ temp;
    }
}

// AES AddRoundKey: XOR state bytes with round key words
void AddRoundKey(inout uint state[16], const uint roundKeyWords[4]) {
    // roundKeyWords are 4 words; bytes are [w0>>24, w0>>16, w0>>8, w0]
    for (int c = 0; c < 4; ++c) {
        uint rk = roundKeyWords[c];
        // column-major mapping: state[c*4 + row]
        state[c*4 + 0] ^= (rk >> 24) & 0xFFu;
        state[c*4 + 1] ^= (rk >> 16) & 0xFFu;
        state[c*4 + 2] ^= (rk >> 8) & 0xFFu;
        state[c*4 + 3] ^= (rk) & 0xFFu;
    }
}

void SubBytes(inout uint state[16]) {
    for (int i = 0; i < 16; ++i) {
        state[i] = sbox[state[i] & 0xFFu];
    }
}

void ShiftRows(inout uint state[16]) {
    // operate on a copy because shifts read original positions
    uint tmp[16];
    for (int i = 0; i < 16; ++i) tmp[i] = state[i];
    // row 0 (r=0): no shift
    // row 1 (r=1): shift left by 1
    // row 2 (r=2): shift left by 2
    // row 3 (r=3): shift left by 3
    for (int r = 0; r < 4; ++r) {
        for (int c = 0; c < 4; ++c) {
            int srcC = (c + r) % 4;
            state[c*4 + r] = tmp[srcC*4 + r];
        }
    }
}

void MixColumns(inout uint state[16]) {
    for (int c = 0; c < 4; ++c) {
        uint i0 = state[c*4 + 0];
        uint i1 = state[c*4 + 1];
        uint i2 = state[c*4 + 2];
        uint i3 = state[c*4 + 3];

        uint t0 = (gmul(0x02u, i0) ^ gmul(0x03u, i1) ^ i2 ^ i3) & 0xFFu;
        uint t1 = (i0 ^ gmul(0x02u, i1) ^ gmul(0x03u, i2) ^ i3) & 0xFFu;
        uint t2 = (i0 ^ i1 ^ gmul(0x02u, i2) ^ gmul(0x03u, i3)) & 0xFFu;
        uint t3 = (gmul(0x03u, i0) ^ i1 ^ i2 ^ gmul(0x02u, i3)) & 0xFFu;

        state[c*4 + 0] = t0;
        state[c*4 + 1] = t1;
        state[c*4 + 2] = t2;
        state[c*4 + 3] = t3;
    }
}

// Convert 16 bytes (state) into 4 words (big-endian per word)
void BytesToWords(const uint bytes[16], out uint words[4]) {
    for (int c = 0; c < 4; ++c) {
        uint b0 = bytes[c*4 + 0] & 0xFFu;
        uint b1 = bytes[c*4 + 1] & 0xFFu;
        uint b2 = bytes[c*4 + 2] & 0xFFu;
        uint b3 = bytes[c*4 + 3] & 0xFFu;
        words[c] = (b0 << 24) | (b1 << 16) | (b2 << 8) | b3;
    }
}

void WordsToBytes(const uint words[4], out uint bytes[16]) {
    for (int c = 0; c < 4; ++c) {
        uint w = words[c];
        bytes[c*4 + 0] = (w >> 24) & 0xFFu;
        bytes[c*4 + 1] = (w >> 16) & 0xFFu;
        bytes[c*4 + 2] = (w >> 8) & 0xFFu;
        bytes[c*4 + 3] = w & 0xFFu;
    }
}

// AES-128 encrypt a single 16-byte block in 'state' using 176-byte roundKeys (44 words)
void AES128_Encrypt(inout uint state[16], const uint roundKeys[44]) {
    // initial AddRoundKey with roundKeys[0..3]
    uint rkWords[4];
    for (int i = 0; i < 4; ++i) rkWords[i] = roundKeys[i];
    AddRoundKey(state, rkWords);

    // 9 main rounds
    for (int round = 1; round <= 9; ++round) {
        SubBytes(state);
        ShiftRows(state);
        MixColumns(state);
        for (int i = 0; i < 4; ++i) rkWords[i] = roundKeys[round*4 + i];
        AddRoundKey(state, rkWords);
    }

    // final round (no MixColumns)
    SubBytes(state);
    ShiftRows(state);
    for (int i = 0; i < 4; ++i) rkWords[i] = roundKeys[10*4 + i];
    AddRoundKey(state, rkWords);
}

void main() {
    // Sample the original color
    vec4 pix = texture(tex, v_texcoord);
    vec3 color = pix.rgb;

    // Convert color channels to bytes 0..255
    uint b0 = uint(clamp(color.r * 255.0, 0.0, 255.0) + 0.5);
    uint b1 = uint(clamp(color.g * 255.0, 0.0, 255.0) + 0.5);
    uint b2 = uint(clamp(color.b * 255.0, 0.0, 255.0) + 0.5);

    // Prepare 16-byte block: first three bytes RGB, rest padding (you can change)
    uint block[16];
    for (int i = 0; i < 16; ++i) block[i] = 0u;
    block[0] = b0;
    block[1] = b1;
    block[2] = b2;
    block[3] = 0u; // padding / alpha placeholder

    // Derive AES-128 key from 'time':
    // use floatBitsToUint on several offsets to produce 4 words.
    uint k0 = floatBitsToUint(floor(time));
    uint k1 = floatBitsToUint(floor(time) + 1.0);
    uint k2 = floatBitsToUint(floor(time) + 2.0);
    uint k3 = floatBitsToUint(floor(time) + 3.0);

    // keyWords: big-endian words (we'll keep words as-is)
    uint keyWords0[4];
    keyWords0[0] = k0;
    keyWords0[1] = k1;
    keyWords0[2] = k2;
    keyWords0[3] = k3;

    // Expand key to round keys
    uint roundKeys[44];
    KeyExpansion(keyWords0, roundKeys);

    // Encrypt the block
    AES128_Encrypt(block, roundKeys);

    // Map encrypted bytes back to RGB (take first three bytes)
    float outR = float(block[0] & 0xFFu) / 255.0;
    float outG = float(block[1] & 0xFFu) / 255.0;
    float outB = float(block[2] & 0xFFu) / 255.0;

    fragColor = vec4(outR, outG, outB, 1.0);
}
