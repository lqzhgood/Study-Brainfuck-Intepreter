import { Code, Opcode } from './opcode';

type IrCode = {
    key: Opcode;
    num: number;
};

export class Ir {
    code: InstanceType<typeof Code>;
    irCode: IrCode[] = [];
    stack: number[] = [0];
    res: string = '';

    get irCode_len() {
        return this.irCode.length;
    }

    constructor(code: InstanceType<typeof Code>) {
        this.code = code;
        this.convert();
    }

    convert() {
        const instruction: IrCode[] = [];
        const jump_stack = [];

        for (const e of this.code.instruction) {
            const last = instruction.slice(-1)[0];
            switch (e) {
                case Opcode.SHR: {
                    if (last?.key === Opcode.SHR) {
                        last.num += 1;
                    } else {
                        instruction.push({ key: Opcode.SHR, num: 1 });
                    }
                    break;
                }
                case Opcode.SHL: {
                    if (last?.key === Opcode.SHL) {
                        last.num += 1;
                    } else {
                        instruction.push({ key: Opcode.SHL, num: 1 });
                    }
                    break;
                }
                case Opcode.ADD: {
                    if (last?.key === Opcode.ADD) {
                        last.num = (last.num + 1) % 255;
                    } else {
                        instruction.push({ key: Opcode.ADD, num: 1 });
                    }
                    break;
                }
                case Opcode.SUB: {
                    if (last?.key === Opcode.SUB) {
                        last.num = (last.num + 1) % 255;
                    } else {
                        instruction.push({ key: Opcode.SUB, num: 1 });
                    }
                    break;
                }
                case Opcode.PutChar: {
                    instruction.push({ key: Opcode.PutChar, num: 0 });
                    break;
                }
                case Opcode.GetChar: {
                    instruction.push({ key: Opcode.GetChar, num: 0 });
                    break;
                }
                case Opcode.LB: {
                    instruction.push({ key: Opcode.LB, num: 0 });
                    jump_stack.push(instruction.length - 1); // 这里的 -1 就是去掉上一行 push 的 IR::JNZ
                    break;
                }
                case Opcode.RB: {
                    const j = jump_stack.pop();
                    if (j === undefined) {
                        throw new Error('括号指令未成对 [pop from empty list]');
                    }
                    instruction.push({ key: Opcode.RB, num: j });

                    const curr_position = instruction.length - 1;
                    const lastLB = instruction[j];
                    if (lastLB.key !== Opcode.LB) {
                        throw new Error('LB不存在，括号不成对');
                    }
                    lastLB.num = curr_position;
                    break;
                }

                default:
                    break;
            }
        }

        this.irCode = instruction;
    }

    run() {
        let pc = 0;
        let sp = 0;

        while (1) {
            if (pc >= this.irCode_len) {
                break;
            }

            const { key, num } = this.irCode[pc];
            switch (key) {
                case Opcode.SHR: {
                    sp += num;
                    if (sp >= this.stack.length) {
                        const expand = sp - this.stack.length + 1;
                        const temp = new Array(expand).fill(0);
                        this.stack = this.stack.concat(temp);
                    }
                    break;
                }
                case Opcode.SHL: {
                    const sub = sp - num <= 0 ? sp : num;
                    sp -= sub;
                    break;
                }
                case Opcode.ADD: {
                    const curr = (this.stack[sp] + num) % 256;
                    this.stack[sp] = curr;
                    break;
                }
                case Opcode.SUB: {
                    let res = (this.stack[sp] - num) % 256;
                    if (res < 0) {
                        res += 256;
                    }
                    this.stack[sp] = res;
                    break;
                }
                case Opcode.PutChar: {
                    const c = String.fromCharCode(this.stack[sp]);
                    this.write(c);
                    break;
                }
                case Opcode.GetChar: {
                    const s = prompt('请输入一个字符') || '';
                    const c = s.charCodeAt(0);
                    this.stack[sp] = c >= 0 && c <= 255 ? c : 0;
                    break;
                }
                case Opcode.LB: {
                    if (this.stack[sp] === 0x00) {
                        pc = num;
                    }

                    break;
                }
                case Opcode.RB: {
                    if (this.stack[sp] !== 0x00) {
                        pc = num;
                    }
                    break;
                }

                default:
                    break;
            }

            pc++;
        }

        return this.res;
    }

    write(s: string) {
        // console.log('s', s);
        this.res += s;
    }

    clear() {
        this.stack = [0];
        this.res = '';
    }
}
