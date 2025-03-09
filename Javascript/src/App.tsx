import { Alert, Typography } from 'antd';
// import Decode from './Decode';
import EnterCode from './EnterCode';
import SelectBf from './SelectBf';
import Decode from './Decode';

const { Title } = Typography;
const { ErrorBoundary } = Alert;

function App() {
    return (
        <>
            <Title level={1} style={{ textAlign: 'center' }}>
                Brainfuck 解释器
            </Title>
            <SelectBf />
            <EnterCode />
            <ErrorBoundary>
                <Decode />
            </ErrorBoundary>
        </>
    );
}

export default App;
