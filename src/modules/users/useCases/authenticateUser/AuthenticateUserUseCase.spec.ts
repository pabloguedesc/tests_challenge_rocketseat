import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepository: IUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

const email = "pabloguedesc@email.com";
const password = "pablo123";

describe("AuthenticateUserUseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
  });

  it("Should be able to authenticate user", async () => {
    await createUserUseCase.execute({
      name: "Pablo",
      password,
      email,
    });
    const userSession = await authenticateUserUseCase.execute({
      email,
      password,
    });

    expect(userSession).toHaveProperty("token");
    expect(userSession).toHaveProperty("user");
    expect(userSession.user).toHaveProperty("id");
    expect(userSession.user.name).toEqual("Pablo");
    expect(userSession.user.email).toEqual(email);
  });

  it("should be not able to authenticate user with not exist user", async () => {
    expect(async () => {
      const userSession = await authenticateUserUseCase.execute({
        email: "teste@teste.com",
        password,
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should be not able to authenticate user password wrong", async () => {
    await createUserUseCase.execute({
      name: "Pablo",
      password,
      email,
    });

    expect(async () => {
      await authenticateUserUseCase.execute({
        email,
        password: "123456",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
