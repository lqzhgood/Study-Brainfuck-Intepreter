import { Divider, Typography } from 'antd';
import { useStore } from '../store';
import { Code, Opcode } from './opcode';
import { Interpreter } from './interpreter';
import { Ir } from './ir';

const { Text, Title } = Typography;

const Decode = () => {
    const { sourceCode } = useStore();

    const code = new Code(sourceCode);

    console.time('origin');
    const interpreter = new Interpreter(code);
    const res = interpreter.run();
    console.timeEnd('origin');

    console.time('ir');
    const ir = new Ir(code);
    const res_ir = ir.run();
    console.timeEnd('ir');

    return (
        <div>
            <Title level={4}>指令集</Title>
            <Text code>length: {code.instruction.length} </Text>
            {code.instruction.map(n => (
                <Text code>{Opcode[n]}</Text>
            ))}
            <Title level={4}>结果</Title>
            <Text code>{res}</Text>

            <Divider>Ir 优化</Divider>
            <Text code>length: {ir.irCode.length} </Text>
            {ir.irCode.map(n => (
                <Text code>{`${Opcode[n.key]}(${n.num})`}</Text>
            ))}
            <Title level={4}>结果</Title>
            <Text code>{res_ir}</Text>
        </div>
    );
};

export default Decode;
