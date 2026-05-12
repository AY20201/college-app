export const useAsync = () => ({ loading: false, result: undefined, error: undefined });
export const useAsyncCallback = (fn) => [fn, { loading: false, result: undefined, error: undefined }];
export default {};