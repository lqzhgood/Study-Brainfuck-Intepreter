import { Typography } from 'antd';
import { useStore } from '../store';
import { Code } from './opcode';
import { Interpreter } from './interpreter';

const { Text, Title } = Typography;

const Decode = () => {
    const { sourceCode } = useStore();

    const code = new Code(sourceCode);

    const interpreter = new Interpreter(code);
    const res = interpreter.run();

    return (
        <div>
            <Title level={4}>指令集</Title>
            <Text code>{JSON.stringify(code.instruction)}</Text>
            <Title level={4}>结果</Title>
            <Text code>{res}</Text>
        </div>
    );
};

export default Decode;
