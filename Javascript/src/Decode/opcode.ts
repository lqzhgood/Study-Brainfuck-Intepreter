// SHR      >  指针加一
// SHL      <  指针减一
// ADD      +  指针所指字节的值加一
// SUB      -  指针所指字节的值减一
// PutChar  .  输出指针所指字节内容（ASCII码）
// GetChar  ,  向指针所指的字节输入内容（ASCII码）
// LB       [  若指针所指字节的值为零，则向后跳转，跳转到其对应的]的下一个指令处
// RB       ]  若指针所指字节的值不为零，则向前跳转，跳转到其对应的[的下一个指令处

export const enum Opcode {
    SHR = 0x3e,
    SHL = 0x3c,
    ADD = 0x2b,
    SUB = 0x2d,
    PutChar = 0x2e,
    GetChar = 0x2c,
    LB = 0x5b,
    RB = 0x5d,
}

export function OpcodeFrom(u: number) {
    switch (u) {
        case 0x3e:
            return Opcode.SHR;
        case 0x3c:
            return Opcode.SHL;
        case 0x2b:
            return Opcode.ADD;
        case 0x2d:
            return Opcode.SUB;
        case 0x2e:
            return Opcode.PutChar;
        case 0x2c:
            return Opcode.GetChar;
        case 0x5b:
            return Opcode.LB;
        case 0x5d:
            return Opcode.RB;
        default:
            throw new Error('unreachable');
    }
}

export class Code {
    // 指令集
    instruction: Opcode[];
    // 存储 [ 和 ] 的位置关系
    jump_table: Map<number, number> = new Map();

    static DICT = [
        Opcode.SHR,
        Opcode.SHL,
        Opcode.ADD,
        Opcode.SUB,
        Opcode.PutChar,
        Opcode.GetChar,
        Opcode.LB,
        Opcode.RB,
    ];

    constructor(data: string) {
        this.instruction = str2utf8(data)
            .filter(x => Code.DICT.includes(x))
            .map(x => OpcodeFrom(x));

        // 借助栈结构来匹配 [ 和 ] 符号，然后存入 jump_table 中
        const jump_stack = [];
        const jump_table = this.jump_table;
        for (let i = 0; i < this.instruction.length; i++) {
            const e = this.instruction[i];
            if (Opcode.LB === e) {
                jump_stack.push(i);
            }

            if (Opcode.RB === e) {
                if (jump_stack.length === 0) {
                    throw new Error('括号指令未成对 [pop from empty list]');
                }
                let j = jump_stack.pop();
                jump_table.set(j!, i);
                jump_table.set(i, j!);
            }
        }
    }
}

function str2utf8(str: string) {
    const encoder = new TextEncoder();
    const u8Arr = encoder.encode(str);
    return Array.from(u8Arr);
}
