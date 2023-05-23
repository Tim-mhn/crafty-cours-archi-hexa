import Fastify from "fastify";
import { PostMessageUseCase } from "../application/use-cases/post-message.use-case";
import { PrismaMessageRepository } from "../infrastructure/repositories/message.prisma.repository";
import { DateProvider } from "../application/providers/date.provider";
import { PrismaClient } from "@prisma/client";
// import * as createError from "http-errors"
const prismaClient = new PrismaClient();

const messageRepository = new PrismaMessageRepository(prismaClient);
class RealDateProvider implements DateProvider {
  getCurrentDate(): Date {
    return new Date();
  }
}
const postMessageUseCase = new PostMessageUseCase(
  new RealDateProvider(),
  messageRepository
);

// const viewUserMessagesTimelineUseCase = new ViewUserMessagesTimelineUseCase(
//   new RealDateProvider(),
//   messageRepository
// );

// const editMessageUseCase = new EditMessageUseCase(messageRepository);

// const fsUserFollowersRepository = new PrismaUserFollowersRepository(
//   prismaClient
// );
// const followUserUseCase = new FollowUserUseCase(fsUserFollowersRepository);

// const viewUserWallUseCase = new ViewMessagesWallOfUserUseCase(
//   messageRepository,
//   fsUserFollowersRepository,
//   new RealDateProvider()
// );
const app = Fastify({ logger: true });

// app.post("/message", {}, async (req, res) => {
//   console.log("message request");
//   const { message, user } = req.body as { message: string; user: string };
//   const postMessageCommand: PostMessageCommand = {
//     author: user,
//     text: message,
//     id: Math.floor(Math.random() * 1e9).toString(),
//   };

//   try {
//     await postMessageUseCase.handle(postMessageCommand);
//     res.status(200).send();
//   } catch (err) {
//     console.error("Error :", (err as Error).stack);
//     res.status(500).send({ error: err });
//   }
// });

app.get("/ping", {}, async (request, reply) => {
  return { pong: "it worked!" };
});

// const start = async () => {
//   try {
//     await app.listen({ port: 3000 });
//   } catch (err) {
//     app.log.error(err);
//     process.exit(1);
//   }
// };
// start();
app.listen({ port: 3000 }, (err, address) => {
  if (err) throw err;
  // Server is now listening on ${address}
});
