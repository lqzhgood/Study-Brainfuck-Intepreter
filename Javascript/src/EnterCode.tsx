import { Typography, Input } from 'antd';
import { actions, useStore } from './store';

const { Title } = Typography;
const { TextArea } = Input;

const EnterCode = () => {
    const { sourceCode } = useStore();
    return (
        <>
            <Title level={4}>源码</Title>
            <TextArea
                style={{ minHeight: 300 }}
                autoSize
                placeholder='请输入源码'
                value={sourceCode}
                onChange={e => {
                    actions.setsSourceCode(e.target.value);
                }}
            />
        </>
    );
};

export default EnterCode;
