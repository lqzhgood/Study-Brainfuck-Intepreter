import { Divider, Alert, Typography } from 'antd';
import Decode from './Decode';
import EnterCode from './EnterCode';
import { useStore } from './store';
import SelectBf from './SelectBf';

const { Title } = Typography;
const { ErrorBoundary } = Alert;

function App() {
    const { sourceCode } = useStore();
    return (
        <>
            <Title level={1} style={{ textAlign: 'center' }}>
                Brainfuck 解释器
            </Title>
            <SelectBf />
            <EnterCode />
            <Divider>👇</Divider>
            {/* <ErrorBoundary key={sourceCode.length}>
                <Decode />
            </ErrorBoundary> */}
        </>
    );
}

export default App;
