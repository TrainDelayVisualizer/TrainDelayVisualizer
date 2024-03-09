export class ServiceError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, ServiceError.prototype);
    }
}