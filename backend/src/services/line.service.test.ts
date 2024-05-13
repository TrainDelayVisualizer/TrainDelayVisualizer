import { assert } from "console";
import { LineService } from "./line.service";
import { DataAccessClient } from "../database/data-access.client";
import { Line } from "@prisma/client";



describe(LineService.name, () => {
    it('should return a list of lines', async () => {
        const dataAccess = new DataAccessClient();
        const lineService = new LineService(dataAccess);

        const linesInDb: Line[] = [
            {
                name: 'Line 1',
                trainType: 'express',
            },
        ];

        lineService['dataAccess'].client.line.findMany = jest.fn().mockResolvedValue(linesInDb);

        const lines = await lineService.getLines();

        assert(lines.length === 1);
        assert(lines[0] == linesInDb[0]);
    });

    it('should return an empty list of lines', async () => {
        const dataAccess = new DataAccessClient();
        const lineService = new LineService(dataAccess);

        const linesInDb: Line[] = [];

        lineService['dataAccess'].client.line.findMany = jest.fn().mockResolvedValue(linesInDb);

        const lines = await lineService.getLines();

        assert(lines.length === 0);
    });

    it('should throw an error', async () => {
        const dataAccess = new DataAccessClient();
        const lineService = new LineService(dataAccess);

        lineService['dataAccess'].client.line.findMany = jest.fn().mockRejectedValue(new Error('Database error'));

        try {
            await lineService.getLines();
            assert(false);
        } catch (error: unknown) {
            if (error instanceof Error) {
                assert(error.message === 'Database error');
            } else {
                assert(false);
            }
        }
    });
});
