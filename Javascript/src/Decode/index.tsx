import { Typography } from 'antd';
import { useStore } from '../store';
import { Code } from './opcode';

const { Text, Title } = Typography;

const Decode = () => {
    const { sourceCode } = useStore();

    const code = new Code(sourceCode);

    console.log('code', code.instruction);

    return (
        <div>
            <Title level={4}>指令集</Title>
            <Text code>{JSON.stringify(code.instruction)}</Text>
        </div>
    );
};

export default Decode;
