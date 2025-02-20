mod opcode;

use opcode::Opcode;
use std::io::Read;
use std::io::Write;

pub enum IR {
    SHR(u32),
    SHL(u32),
    ADD(u8),
    SUB(u8),
    PutChar,
    GetChar,
    JIZ(u32), // jump if zero
    JNZ(u32), // jump if not zero
}

pub struct Code {
    pub instruction: Vec<IR>,
}

impl Code {
    pub fn from(data: Vec<opcode::Opcode>) -> Result<Self, Box<dyn std::error::Error>> {
        let mut instruction: Vec<IR> = Vec::new();
        let mut jump_stack: Vec<u32> = Vec::new();

        for e in data {
            match e {
                // 因为 instruction 也是顺序填入的
                // 如果当前 instruction 最后一个是 SHR，那么也就是和当前相同
                // 那么就可以“折叠”成一个 SHR 指令
                opcode::Opcode::SHR => match instruction.last_mut() {
                    Some(IR::SHR(x)) => {
                        *x += 1;
                    }
                    _ => {
                        instruction.push(IR::SHR(1));
                    }
                },
                opcode::Opcode::SHL => match instruction.last_mut() {
                    Some(IR::SHL(x)) => {
                        *x += 1;
                    }
                    _ => {
                        instruction.push(IR::SHL(1));
                    }
                },
                opcode::Opcode::ADD => match instruction.last_mut() {
                    Some(IR::ADD(x)) => {
                        let (b, _) = x.overflowing_add(1);
                        *x = b;
                    }
                    _ => {
                        instruction.push(IR::ADD(1));
                    }
                },
                opcode::Opcode::SUB => match instruction.last_mut() {
                    Some(IR::SUB(x)) => {
                        let (b, _) = x.overflowing_add(1);
                        *x = b;
                    }
                    _ => {
                        instruction.push(IR::SUB(1));
                    }
                },
                Opcode::PutChar => {
                    instruction.push(IR::PutChar);
                }
                Opcode::GetChar => {
                    instruction.push(IR::GetChar);
                }
                opcode::Opcode::LB => {
                    instruction.push(IR::JIZ(0)); // 0 仅填充 无意义
                    jump_stack.push((instruction.len() - 1) as u32); // 这里的 -1 就是去掉上一行 push 的 IR::JNZ
                }
                opcode::Opcode::RB => {
                    // 括号一定是成对出现的，那么 jump_stack 中的上一个一定是 LB
                    let j = jump_stack
                        .pop()
                        .ok_or("括号指令未成对 [pop from empty list]")?;
                    instruction.push(IR::JNZ(j));

                    let curr_position = instruction.len() - 1; // 当前 IR::JNZ 的位置

                    // 这里就是上一个 LB 的位置，将无意义的 0 修改为 RB 的位置
                    match &mut instruction[j as usize] {
                        IR::JIZ(x) => {
                            *x = curr_position as u32;
                        }
                        _ => unreachable!(),
                    }
                }
            }
        }

        Ok(Code { instruction })
    }
}

struct Interpreter {
    // 表示无限长的纸带
    stack: Vec<u8>,
}

impl Interpreter {
    fn new() -> Self {
        Self { stack: vec![0; 1] }
    }

    fn run(&mut self, data: Vec<u8>) -> Result<(), Box<dyn std::error::Error>> {
        let opcode_code = opcode::Code::from(data)?;
        let code = Code::from(opcode_code.instruction)?;
        let code_len = code.instruction.len();

        let mut pc = 0;
        let mut sp = 0;

        loop {
            if pc >= code_len {
                break;
            }

            match code.instruction[pc] {
                IR::SHR(x) => {
                    sp += x as usize;
                    // 程序的位置增加，后面补0

                    if sp >= self.stack.len() {
                        let expand = sp - self.stack.len() + 1;
                        for _ in 0..expand {
                            self.stack.push(0);
                        }
                    }
                }
                IR::SHL(x) => {
                    for _ in 0..x {
                        if sp != 0 {
                            sp -= 1
                        } else {
                            break;
                        }
                    }
                }
                // 当前程序位置+1，允许溢出  255:u8 + 2 = 1
                IR::ADD(x) => {
                    self.stack[sp] = self.stack[sp].overflowing_add(x).0;
                }
                IR::SUB(x) => {
                    self.stack[sp] = self.stack[sp].overflowing_sub(x).0;
                }
                // 输出程序位置(ASCII)内容
                IR::PutChar => {
                    std::io::stdout().write_all(&[self.stack[sp]])?;
                }
                // 向程序位置写入(ASCII)内容
                IR::GetChar => {
                    let mut buf: Vec<u8> = vec![0; 1];
                    std::io::stdin().read_exact(&mut buf)?;
                    self.stack[sp] = buf[0];
                }
                IR::JIZ(x) => {
                    if self.stack[sp] == 0x00 {
                        pc = x as usize;
                    }
                }
                IR::JNZ(x) => {
                    if self.stack[sp] != 0x00 {
                        pc = x as usize;
                    }
                }
            }

            pc += 1;
        }

        Ok(())
    }
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = std::env::args().collect();
    let data = std::fs::read(&args[1])?;

    let mut interpreter = Interpreter::new();
    interpreter.run(data)?;

    Ok(())
}
