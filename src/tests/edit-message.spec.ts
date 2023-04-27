import { Message } from "../entities";
import { EmptyMessageForbidden } from "../errors/post-message.errors";
import { InMemoryMessageRepository } from "../repositories/message.in-memory.repository";
import { MessageRepository } from "../repositories/message.repository";
import { EditMessageUseCase } from "../use-cases/edit-message.use-case";
import { messageBuilder } from "./message.builder";

describe("Feature: edit a message already posted", () => {
  let fixture: EditMessageTestFixture;

  beforeEach(() => {
    fixture = new EditMessageTestFixture();
  });

  it("a user can edit her message with a text shorter than 280 characters", async () => {
    const message = messageBuilder()
      .withText("Hello wrld")
      .withId("message-id")
      .build();
    await fixture.givenMessageWasPosted(message);

    await fixture.whenUserEditsMessage({
      messageId: "message-id",
      text: "Hello world",
    });

    await fixture.thenMessageShouldBe({
      id: "message-id",
      text: "Hello world",
    });
  });

  it("a user can not edit her message with an empty text", async () => {
    const message = messageBuilder().withId("message-id").build();
    await fixture.givenMessageWasPosted(message);

    await fixture.whenUserEditsMessage({
      messageId: "message-id",
      text: "",
    });

    await fixture.thenShouldThrowError(EmptyMessageForbidden);
  });
});

class EditMessageTestFixture {
  messageRepository = new InMemoryMessageRepository();
  editMessageUseCase = new EditMessageUseCase(this.messageRepository);

  async givenMessageWasPosted(message: Message) {
    await this.messageRepository.saveMessage(message);
  }
  async whenUserEditsMessage({
    messageId,
    text,
  }: {
    messageId: string;
    text: string;
  }) {
    try {
      await this.editMessageUseCase.handle({ messageId, text });
    } catch (err) {
      this.errorThrown = err;
    }
  }

  async thenMessageShouldBe(expectedMessage: { id: string; text: string }) {
    const { id, text } = await this.messageRepository.getMessageById(
      expectedMessage.id
    );
    expect({ id, text }).toEqual(expectedMessage);
  }

  errorThrown: Error;

  thenShouldThrowError(errorClass: new () => Error) {
    expect(this.errorThrown).toBeInstanceOf(errorClass);
  }
}