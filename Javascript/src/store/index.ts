import { proxy } from 'valtio';
import { useProxy } from 'valtio/utils';

const defaultSourceCode =
    `++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.`.trim();

const state = proxy({
    sourceCode: defaultSourceCode,
});

export function useStore() {
    return useProxy(state, {
        sync: true,
    });
}

export const actions = {
    setsSourceCode: (value: string) => {
        state.sourceCode = value.trim();
    },
};
