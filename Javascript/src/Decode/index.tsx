import { Typography } from 'antd';
import { useStore } from '../store';
import { Code } from './opcode';
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
    const res2 = ir.run();
    console.timeEnd('ir');

    return (
        <div>
            <Title level={4}>指令集</Title>
            <Text code>{JSON.stringify(code.instruction)}</Text>
            <Title level={4}>结果</Title>
            <Text code>{res}</Text>
            <Text code>{res2}</Text>
        </div>
    );
};

export default Decode;
