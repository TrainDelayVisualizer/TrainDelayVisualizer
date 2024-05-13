import { ServiceError } from "./model/service.exception";
import { getWrapper, postWrapper } from "./server";
import { Request, Response } from "express";

describe("server", () => {
    it("getWrapper should run function correctly", async () => {
        const req = {} as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        } as unknown as Response;
        const func: jest.Mock<Promise<string>, []> = jest.fn().mockResolvedValue("test");
        await getWrapper(req, res, func);
        expect(func).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith("test");
    });

    it("getWrapper should handle error correctly", async () => {
        console.error = jest.fn();

        const req = {} as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        } as unknown as Response;
        const func: jest.Mock<Promise<string>, []> = jest.fn().mockRejectedValue(new Error("test"));
        await getWrapper(req, res, func);
        expect(func).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ result: 'error' });
        expect(console.error).toHaveBeenCalled();
    });

    it("getWrapper should handle ServiceError correctly", async () => {
        console.error = jest.fn();

        const req = {} as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        } as unknown as Response;
        const func: jest.Mock<Promise<string>, []> = jest.fn().mockRejectedValue(new ServiceError("test"));
        await getWrapper(req, res, func);
        expect(func).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ result: 'error', message: "test" });
        expect(console.error).not.toHaveBeenCalled();
    });

    it("postWrapper should run function correctly", async () => {
        const req = {
            body: "test"
        } as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        } as unknown as Response;
        const func: jest.Mock<Promise<string>, [string]> = jest.fn().mockResolvedValue("test");
        await postWrapper(req, res, func);
        expect(func).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith("test");
    });

    it("postWrapper should handle error correctly", async () => {
        console.error = jest.fn();

        const req = {
            body: "test"
        } as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        } as unknown as Response;
        const func: jest.Mock<Promise<string>, [string]> = jest.fn().mockRejectedValue(new Error("test"));
        await postWrapper(req, res, func);
        expect(func).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ result: 'error' });
        expect(console.error).toHaveBeenCalled();
    });

    it("postWrapper should handle ServiceError correctly", async () => {
        console.error = jest.fn();

        const req = {
            body: "test"
        } as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        } as unknown as Response;
        const func: jest.Mock<Promise<string>, [string]> = jest.fn().mockRejectedValue(new ServiceError("test"));
        await postWrapper(req, res, func);
        expect(func).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ result: 'error', message: "test" });
        expect(console.error).not.toHaveBeenCalled();
    });

});