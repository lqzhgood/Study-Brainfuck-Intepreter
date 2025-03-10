use super::opcode;

use std::fmt;

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
impl fmt::Display for IR {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            IR::SHR(n) => write!(f, "SHR {}", n),
            IR::SHL(n) => write!(f, "SHL {}", n),
            IR::ADD(v) => write!(f, "ADD {}", v),
            IR::SUB(v) => write!(f, "SUB {}", v),
            IR::PutChar => write!(f, "PutChar"),
            IR::GetChar => write!(f, "GetChar"),
            IR::JIZ(addr) => write!(f, "JIZ {}", addr),
            IR::JNZ(addr) => write!(f, "JNZ {}", addr),
        }
    }
}

pub struct Code {
    pub instruction: Vec<IR>,
}

impl Code {
    pub fn from(instr: Vec<opcode::Opcode>) -> Result<Self, Box<dyn std::error::Error>> {
        let mut instruction: Vec<IR> = Vec::new();
        let mut jump_stack: Vec<u32> = Vec::new();

        for e in instr {
            let last = instruction.last_mut();
            match e {
                // 因为 instruction 也是顺序填入的
                // 如果当前 instruction 最后一个是 SHR，那么也就是和当前相同
                // 那么就可以“折叠”成一个 SHR 指令
                opcode::Opcode::SHR => match last {
                    Some(IR::SHR(x)) => {
                        *x += 1;
                    }
                    _ => {
                        instruction.push(IR::SHR(1));
                    }
                },
                opcode::Opcode::SHL => match last {
                    Some(IR::SHL(x)) => {
                        *x += 1;
                    }
                    _ => {
                        instruction.push(IR::SHL(1));
                    }
                },
                opcode::Opcode::ADD => match last {
                    Some(IR::ADD(x)) => {
                        let (b, _) = x.overflowing_add(1);
                        *x = b;
                    }
                    _ => {
                        instruction.push(IR::ADD(1));
                    }
                },
                opcode::Opcode::SUB => match last {
                    Some(IR::SUB(x)) => {
                        let (b, _) = x.overflowing_add(1);
                        *x = b;
                    }
                    _ => {
                        instruction.push(IR::SUB(1));
                    }
                },
                opcode::Opcode::PutChar => {
                    instruction.push(IR::PutChar);
                }
                opcode::Opcode::GetChar => {
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
