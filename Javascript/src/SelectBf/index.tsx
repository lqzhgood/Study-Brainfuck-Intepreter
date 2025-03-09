import { useEffect, useRef, useState } from 'react';
import { Select } from 'antd';
import { actions } from '../store';

const SelectBf = () => {
    const [bf, setBf] = useState();
    const [list, setList] = useState([]);
    const controller = useRef<AbortController | null>(null);

    const { setsSourceCode } = actions;

    useEffect(() => {
        fetch('./list.json')
            .then(res => res.json())
            .then(res => {
                setList(res);
                if (res.length) {
                    const helloWorld = res.find((v: string) =>
                        v.includes('hello_world')
                    );
                    setBf(helloWorld);
                }
            });
    }, []);

    useEffect(() => {
        if (!bf) {
            controller.current?.abort();
            return;
        }
        let _bf = bf;
        controller.current = new AbortController();
        fetch(`./bf/${bf}`, { signal: controller.current.signal })
            .then(res => res.text())
            .then(res => {
                if (_bf !== bf) {
                    return;
                }
                setsSourceCode(res);
            });
    }, [bf]);

    return (
        <div>
            <Select
                value={bf}
                style={{ width: '100%' }}
                options={list.map(n => ({ label: n, value: n }))}
                onChange={v => setBf(v)}
            />
        </div>
    );
};

export default SelectBf;
