export class StopwatchUtils {
    static async stopwatch<TReturnType>(func: () => Promise<TReturnType>, name: string) {
        const start = Date.now();
        try {
            return await func();
        } finally {
            console.log(`Execution time ${name || func.name}: ${Date.now() - start}ms`);
        }
    }
}