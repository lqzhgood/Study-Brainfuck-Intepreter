// SHR      >  指针加一
// SHL      <  指针减一
// ADD      +  指针所指字节的值加一
// SUB      -  指针所指字节的值减一
// PutChar  .  输出指针所指字节内容（ASCII码）
// GetChar  ,  向指针所指的字节输入内容（ASCII码）
// LB       [  若指针所指字节的值为零，则向后跳转，跳转到其对应的]的下一个指令处
// RB       ]  若指针所指字节的值不为零，则向前跳转，跳转到其对应的[的下一个指令处

#[derive(Debug, PartialEq)]

pub enum Opcode {
    SHR = 0x3E,
    SHL = 0x3C,
    ADD = 0x2B,
    SUB = 0x2D,
    PutChar = 0x2E,
    GetChar = 0x2C,
    LB = 0x5B,
    RB = 0x5D,
}

impl From<u8> for Opcode {
    fn from(u: u8) -> Self {
        match u {
            0x3E => Opcode::SHR,
            0x3C => Opcode::SHL,
            0x2B => Opcode::ADD,
            0x2D => Opcode::SUB,
            0x2E => Opcode::PutChar,
            0x2C => Opcode::GetChar,
            0x5B => Opcode::LB,
            0x5D => Opcode::RB,
            _ => unreachable!(),
        }
    }
}

pub struct Code {
    // 指令集
    pub instruction: Vec<Opcode>,
    // 存储 [ 和 ] 的位置关系
    pub jump_table: std::collections::HashMap<usize, usize>,
}

impl Code {
    pub fn from(data: Vec<u8>) -> Result<Self, Box<dyn std::error::Error>> {
        // TODO 可以作为常量
        let dict: Vec<u8> = vec![
            Opcode::SHR as u8,
            Opcode::SHL as u8,
            Opcode::ADD as u8,
            Opcode::SUB as u8,
            Opcode::PutChar as u8,
            Opcode::GetChar as u8,
            Opcode::LB as u8,
            Opcode::RB as u8,
        ];

        let instruction: Vec<Opcode> = data
            .iter()
            .filter(|x| dict.contains(x))
            .map(|x| Opcode::from(*x))
            .collect();

        // 借助栈结构来匹配 [ 和 ] 符号，然后存入 jump_table 中
        let mut jump_stack: Vec<usize> = Vec::new();
        let mut jump_table: std::collections::HashMap<usize, usize> =
            std::collections::HashMap::new();
        for (i, e) in instruction.iter().enumerate() {
            if Opcode::LB == *e {
                jump_stack.push(i);
            }
            if Opcode::RB == *e {
                let j = jump_stack
                    .pop()
                    .ok_or("括号指令未成对 [pop from empty list]")?;
                jump_table.insert(j, i);
                jump_table.insert(i, j);
            }
        }
        Ok(Code {
            instruction,
            jump_table,
        })
    }
}
