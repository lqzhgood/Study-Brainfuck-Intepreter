import { Code, Opcode } from './opcode';

export class Interpreter {
    code: InstanceType<typeof Code>;
    stack: number[] = [0];
    res: string = '';

    get code_len() {
        return this.code.instruction.length;
    }

    constructor(code: InstanceType<typeof Code>) {
        this.code = code;
    }

    run() {
        let pc = 0; // Program counter 代码运行的位置， 代码是线性运行的
        let sp = 0; // Stack Pointer 程序运行的位置， 例如 [] 跳转会让程序位置跳转

        while (1) {
            if (pc > this.code_len) {
                break;
            }

            switch (this.code.instruction[pc]) {
                case Opcode.SHR:
                    sp++;
                    if (sp === this.stack.length) {
                        this.stack.push(0);
                    }
                    break;
                case Opcode.SHL:
                    if (sp !== 0) {
                        sp--;
                    }
                    break;
                case Opcode.ADD: {
                    const curr = this.stack[sp];
                    this.stack[sp] = curr >= 255 ? 0 : curr + 1;
                    break;
                }
                case Opcode.SUB: {
                    const curr = this.stack[sp];
                    this.stack[sp] = curr <= 0 ? 255 : curr - 1;
                    break;
                }
                case Opcode.PutChar: {
                    const c = String.fromCharCode(this.stack[sp]);
                    this.write(c);
                    break;
                }
                case Opcode.GetChar: {
                    // TODO
                    // this.stack[sp] = ''
                    break;
                }
                case Opcode.LB: {
                    if (this.stack[sp] === 0x00) {
                        pc = this.code.jump_table.get(pc)!;
                    }
                    break;
                }
                case Opcode.RB: {
                    if (this.stack[sp] !== 0x00) {
                        pc = this.code.jump_table.get(pc)!;
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
