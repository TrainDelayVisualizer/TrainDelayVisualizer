import { Service } from "typedi";
import { ServiceError } from "../model/service.exception";

@Service()
export class TestService {

    constructor() {
    }

    public async getTest(): Promise<string> {
        return 'Hello World';
    }

    public async postTest(data: string): Promise<string> {
        return Promise.resolve('Hello World');
    }

    public async getError(): Promise<string> {
        throw new Error('Error');
    }

    public async getServiceError(): Promise<string> {
        throw new ServiceError('This error message is displayed to the user.');
    }
}
