mod opcode;

use std::io::{Read, Write};

use opcode::{Code, Opcode};

struct Interpreter {
    stack: Vec<u8>,
}

impl Interpreter {
    fn new() -> Self {
        Self { stack: vec![0; 1] }
    }

    fn run(&mut self, data: Vec<u8>) -> Result<(), Box<dyn std::error::Error>> {
        let code = Code::from(data)?;
        let code_len = code.instruction.len();
        let mut pc = 0; // Program counter 代码运行的位置， 代码是线性运行的
        let mut sp = 0; // Stack Pointer 程序运行的位置， 例如 [] 跳转会让程序位置跳转

        loop {
            if pc >= code_len {
                break;
            }

            match code.instruction[pc] {
                Opcode::SHR => {
                    sp += 1;
                    // 程序的位置增加，后面补0
                    if sp == self.stack.len() {
                        self.stack.push(0);
                    }
                }
                Opcode::SHL => {
                    if sp != 0 {
                        sp -= 1;
                    }
                }
                // 当前程序位置+1，允许溢出  255:u8 + 2 = 1
                Opcode::ADD => {
                    self.stack[sp] = self.stack[sp].overflowing_add(1).0;
                }
                Opcode::SUB => {
                    self.stack[sp] = self.stack[sp].overflowing_sub(1).0;
                }
                // 输出程序位置(ASCII)内容
                Opcode::PutChar => {
                    std::io::stdout().write_all(&[self.stack[sp]])?;
                }
                // 向程序位置写入(ASCII)内容
                Opcode::GetChar => {
                    let mut buf: Vec<u8> = vec![0; 1];
                    std::io::stdin().read_exact(&mut buf)?;
                    self.stack[sp] = buf[0];
                }
                Opcode::LB => {
                    if self.stack[sp] == 0x00 {
                        pc = code.jump_table[&pc];
                    }
                }
                Opcode::RB => {
                    if self.stack[sp] != 0x00 {
                        pc = code.jump_table[&pc];
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

    // let code = Code::from(data)?;
    // println!("{:?}", code.instruction);

    Ok(())
}
