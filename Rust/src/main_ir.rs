use std::io::prelude::*;

use brainfuck::ir::Code;
use brainfuck::ir::IR;
use brainfuck::opcode;

struct Ir {
    // 表示无限长的纸带
    stack: Vec<u8>,
}

impl Ir {
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

    let mut interpreter = Ir::new();
    interpreter.run(data)?;

    Ok(())
}
