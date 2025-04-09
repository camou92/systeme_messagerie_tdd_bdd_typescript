import {
  DateProvider,
  EmptyMessageError,
  Message,
  MessageRepository,
  MessageTooLongError,
  PostMessageCommand,
  PostMessageUseCase,
} from "../post-message.usecase";

describe("Feature: Posting a message", () => {
  describe("Rule: A message can contain a maximum of 280 characters", () => {
    test("Mohamed can post a message on her timeline", () => {
      givenNowIs(new Date("2025-04-19T19:00:00.000Z"));

      whenUserPostsAmessage({
        id: "message-id",
        text: "Hello World",
        author: "Alice",
      });

      thenPostedMessageShouldBe({
        id: "message-id",
        author: "Alice",
        text: "Hello World",
        publishedAt: new Date("2025-04-19T19:00:00.000Z"),
      });
    });

    test("Mohamed cannot post a message with more than 280 characters", () => {
      const textWithLengthOf281 =
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt error officia ipsum consequuntur quaerat vel? Aut ipsa architecto eligendi laboriosam accusantium quod vel ea esse consectetur numquam labore cupiditate praesentium quam ratione nemo ex iusto assumenda corrupti eaque, minima dolorum repellendus fugiat animi velit. Natus cupiditate harum iusto. Reprehenderit id sint eum, quam magnam quos hic minima sed labore nemo recusandae perferendis excepturi cupiditate, quod minus sequi, quae commodi ad! Commodi qui molestiae id consequatur perferendis, reiciendis excepturi et voluptatem nam? Soluta voluptatibus debitis ullam sapiente quis quo quia praesentium omnis perspiciatis similique quisquam nulla sequi iusto id velit, neque expedita a magnam delectus iure? Soluta laudantium, aliquid odit, animi reiciendis dolor saepe dolores perferendis, quasi ipsum iure veniam nisi officia deleniti at blanditiis voluptates voluptatibus a necessitatibus cumque hic labore. Aspernatur aut eum voluptas quod aperiam tempore ipsa magnam amet tempora nihil natus culpa, ad nam eveniet ut dolorem consectetur recusandae quia beatae eaque expedita? Placeat, et. Enim maxime quibusdam aperiam facilis adipisci ab minus illo ad a deleniti, officia tenetur, eos hic recusandae nemo sit sed? Asperiores cum expedita a! Totam eos ipsum animi tempore cumque? Assumenda repudiandae, doloremque accusamus aut vero labore pariatur laborum neque unde maiores hic ratione incidunt illo illum eum laboriosam facere rem esse! Consequuntur odit at architecto neque blanditiis commodi vero tempora ullam officiis numquam voluptate quia consequatur perspiciatis distinctio quisquam nam, vel, illum earum est. Repellat laborum a voluptatem! Voluptatibus modi incidunt, velit iure nihil molestiae repellendus dolorem natus laboriosam repudiandae quo ex similique repellat vero ut nostrum numquam, perspiciatis optio magnam officiis est. Consectetur repudiandae corporis quae sit cum. Tempore nesciunt error maiores nisi eos hic aspernatur ea, corrupti architecto atque pariatur?";
        givenNowIs(new Date("2025-04-19T19:00:00.000Z"));

        whenUserPostsAmessage({
          id: "message-id",
          author: "Mohamed",
          text: textWithLengthOf281
        })

        thenErrorShouldBe(MessageTooLongError)
    });
  });

  describe("Rule: A message cannot be empty", () => {
    test("Mohamed cannot post an empty message", () => {
      givenNowIs(new Date("2025-04-19T19:00:00.000Z"));

        whenUserPostsAmessage({
          id: "message-id",
          author: "Mohamed",
          text: ""
        })
        thenErrorShouldBe(EmptyMessageError)
  })
});
})

let message: Message;
let thrownError: Error | undefined = undefined;

class InMemoryMessageRepository implements MessageRepository {
  save(msg: Message): void {
    message = msg;
  }
}

class StubDateProvider implements DateProvider {
  now: Date;
  getNow(): Date {
    return this.now;
  }
}

const messageRepository = new InMemoryMessageRepository();
const dateProvider = new StubDateProvider();

const postMessageUseCase = new PostMessageUseCase(
  messageRepository,
  dateProvider
);

function givenNowIs(_now: Date) {
  dateProvider.now = _now;
}

function whenUserPostsAmessage(postMessageCommand: PostMessageCommand) {
  try {
    postMessageUseCase.handle(postMessageCommand);
  } catch (err) {
    thrownError = err;
  }
}

function thenPostedMessageShouldBe(expectedMessage: Message) {
  expect(expectedMessage).toEqual(message);
}

function thenErrorShouldBe(expectedErrorClass: new () => Error) {
  expect(thrownError).toBeInstanceOf(expectedErrorClass)
}
