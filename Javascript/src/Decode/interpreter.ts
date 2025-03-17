import { Code, Opcode } from './opcode';

export class Interpreter {
    code: InstanceType<typeof Code>;
    stack: number[] = [0];
    res: string = '';
    isRunning = false;
    /** 程序运行次数 */
    step = 0;

    get code_len() {
        return this.code.instruction.length;
    }

    constructor(code: InstanceType<typeof Code>) {
        this.code = code;
    }

    _makeTask(
        event: {
            onFinish?: (o: string) => void;
        } = {}
    ) {
        const { onFinish } = event;

        let pc = 0; // Program counter 代码运行的位置， 代码是线性运行的
        let sp = 0; // Stack Pointer 程序运行的位置， 例如 [] 跳转会让程序位置跳转

        let done = false;

        const task = () => { 
            if (pc > this.code_len) {
                done = true;
                onFinish?.(this.res);
                return;
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
                    const s = prompt('请输入一个字符') || '';
                    const c = s.charCodeAt(0);
                    this.stack[sp] = c >= 0 && c <= 255 ? c : 0;
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
            this.step++;
        };

        return {
            task,
            getResult: () => this.res,
            isDone: () => done,
            stop: () => {
                pc = 0;
                sp = 0;
                done = true;
                this.clear();
            },
            instance: this,
        };
    }

    run(
        event: {
            onCompile?: (
                o: ReturnType<InstanceType<typeof Interpreter>['_makeTask']>
            ) => void;
            onFinish?: (o: string) => void;
        } = {}
    ) {
        if (this.isRunning) {
            return;
        }
        this.isRunning = true;

        const { onCompile, onFinish } = event;

        const o = this._makeTask({ onFinish: onFinish });

        function _runTask() {
            requestIdleCallback(idle => {
                while (1) {
                    if (o.isDone()) {
                        break;
                    }

                    // 10ms 留给最后一次任务的执行时间
                    if (idle.timeRemaining() > 0) {
                        // 还有空闲时间，执行任务
                        o.task();
                    } else {
                        // 否则暂停，并在下一次空闲注册任务
                        onCompile?.(o);
                        _runTask();
                        break;
                    }
                }
            });
        }

        _runTask();
        return o;
    }

    write(s: string) {
        this.res += s;
    }

    clear() {
        this.stack = [0];
        this.res = '';
        this.step = 0;
        this.isRunning = false;
    }
}
