import { PrismaClient } from "@prisma/client";
import { MessageRepository } from "../../application/repositories/message.repository";
import { Message } from "../../domain/entities";

export class PrismaMessageRepository implements MessageRepository {
  constructor(private prismaClient: PrismaClient) {}
  async saveMessage(message: Message): Promise<void> {
    const { author, id, publishedAt, text } = message.data;
    const { id: authorId } = await this.prismaClient.user.upsert({
      create: {
        name: author,
      },
      update: {
        name: author,
      },
      where: { name: author },
      select: {
        id: true,
      },
    });
    await this.prismaClient.message.upsert({
      create: {
        id,
        publishedAt,
        text,
        author: {
          connect: {
            id: authorId,
          },
        },
      },
      update: {
        text,
      },
      where: {
        id,
      },
    });
  }
  async getAllMessagesOfUser(user: string): Promise<Message[]> {
    const dbMessages = await this.prismaClient.message.findMany({
      where: {
        author: {
          name: user,
        },
      },
      select: {
        author: {
          select: {
            name: true,
          },
        },
        id: true,
        publishedAt: true,
        text: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
    });

    return dbMessages.map(({ author: { name }, id, publishedAt, text }) =>
      Message.fromProps({ author: name, id, publishedAt, text })
    );
  }
  async getMessageById(messageId: string): Promise<Message> {
    const { author, id, publishedAt, text } =
      await this.prismaClient.message.findFirstOrThrow({
        where: {
          id: messageId,
        },
        select: {
          author: true,
          id: true,
          publishedAt: true,
          text: true,
        },
      });

    return Message.fromProps({
      author: author.name,
      id,
      publishedAt,
      text,
    });
  }
}
