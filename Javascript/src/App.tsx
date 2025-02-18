import { Divider } from 'antd';
import Decode from './Decode';
import EnterCode from './EnterCode';

function App() {
    return (
        <>
            <EnterCode />
            <Divider>👇</Divider>
            <Decode />
        </>
    );
}

export default App;
