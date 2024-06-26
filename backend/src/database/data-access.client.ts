import { Service } from "typedi";
import { Prisma, PrismaClient } from "@prisma/client";
import { ListUtils } from "../utils/list.utils";
import { DefaultArgs } from "@prisma/client/runtime/library";

type PrismaTransactionType = Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$on" | "$connect" | "$disconnect" | "$use" | "$transaction" | "$extends">;

@Service()
export class DataAccessClient {
    client = new PrismaClient();

    async updateManyItems<TEntityType, TKey>(tableName: keyof PrismaTransactionType, itemsToUpdate: TEntityType[],
        primaryKeySelector: (item: TEntityType) => TKey) {
        this.client.$transaction(async (tx) => {
            await this.updateManyItemsWithExistingTransaction(tableName, itemsToUpdate, primaryKeySelector, tx);
        });
    }

    async updateManyItemsWithExistingTransaction<TEntityType, TKey>(tableName: keyof PrismaTransactionType, itemsToUpdate: TEntityType[],
        primaryKeySelector: (item: TEntityType) => TKey, transaction: PrismaTransactionType, primaryKeyField: keyof TEntityType = 'id' as keyof TEntityType) {
        for (const chunk of ListUtils.chunk(itemsToUpdate, 50)) {
            await Promise.all(chunk.map(async dataItem => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (transaction[tableName] as any).update({
                    where: {
                        [primaryKeyField]: primaryKeySelector(dataItem)
                    },
                    data: dataItem
                });
            }));
        }
      }
}