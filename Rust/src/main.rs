mod opcode;

use opcode::{Code, Opcode};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("Hello, world!");

    let args: Vec<String> = std::env::args().collect();
    let data = std::fs::read(&args[1])?;
    let code = Code::from(data)?;

    println!("{:?}", code.instruction);

    Ok(())
}
