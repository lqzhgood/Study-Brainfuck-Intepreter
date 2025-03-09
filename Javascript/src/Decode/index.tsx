import { Button, Divider, Flex, Typography } from 'antd';
import { useStore } from '../store';
import { Code, Opcode } from './opcode';
import { Interpreter } from './interpreter';
import { Ir } from './ir';
import { useEffect, useRef, useState } from 'react';

const { Text, Title } = Typography;

const Decode = () => {
    const { sourceCode } = useStore();
    const [code, setCode] = useState<InstanceType<typeof Code>>();
    const [result, setResult] = useState('');
    const ctrl = useRef<any>(null);

    /** IR */
    const [ir, setIr] = useState<InstanceType<typeof Ir>>();
    const ir_ctrl = useRef<any>(null);
    const [irResult, setIrResult] = useState('');

    useEffect(() => {
        ctrl.current?.stop();
        ir_ctrl.current?.stop();
    }, [sourceCode]);

    return (
        <>
            <Divider>👇 源码执行</Divider>
            <Flex justify='center' gap={16}>
                <Button
                    onClick={() => {
                        const code = new Code(sourceCode);
                        setCode(code);

                        const interpreter = new Interpreter(code);
                        ctrl.current = interpreter.run({
                            onCompile(o) {
                                setResult(o.getResult());
                            },
                            onFinish(res) {
                                setResult(res);
                            },
                        });
                    }}
                    type='primary'
                >
                    开始
                </Button>
                <Button
                    disabled={ctrl.current?.isDone()}
                    onClick={() => {
                        ctrl.current?.stop();
                    }}
                    danger
                >
                    停止
                </Button>
            </Flex>
            <Title level={4}>指令集</Title>
            <Text code>length: {code?.instruction.length}</Text>
            <Text code>step: {ctrl.current?.instance.step}</Text>
            <div style={{ maxHeight: 300, overflow: 'auto' }}>
                {code?.instruction.map((n, i) => (
                    <Text code key={`${n}_${i}`}>
                        {Opcode[n]}
                    </Text>
                ))}
            </div>
            <Title level={4}>结果</Title>
            <Text code>{result}</Text>

            <Divider>👇 IR 优化</Divider>
            <Flex justify='center' gap={16}>
                <Button
                    onClick={() => {
                        const code = new Code(sourceCode);
                        setCode(code);

                        const ir = new Ir(code);
                        setIr(ir);

                        ir_ctrl.current = ir.run({
                            onCompile(o) {
                                setIrResult(o.getResult());
                            },
                            onFinish(res) {
                                setIrResult(res);
                            },
                        });
                    }}
                    type='primary'
                >
                    开始
                </Button>
                <Button
                    disabled={ir_ctrl.current?.isDone()}
                    onClick={() => {
                        ir_ctrl.current?.stop();
                    }}
                    danger
                >
                    停止
                </Button>
            </Flex>
            <Title level={4}>指令集</Title>
            <Text code>length: {ir?.irCode.length}</Text>
            <Text code>step: {ir_ctrl.current?.instance.step}</Text>
            <div style={{ maxHeight: 300, overflow: 'auto' }}>
                {ir?.irCode.map((n, i) => (
                    <Text code key={`${n.key}_${n.num}_${i}`}>{`${
                        Opcode[n.key]
                    }(${n.num})`}</Text>
                ))}
            </div>
            <Title level={4}>结果</Title>
            <Text code>{irResult}</Text>
        </>
    );
};

export default Decode;
