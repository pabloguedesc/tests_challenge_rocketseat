import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepository: IUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("ShowUserProfileUseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
  });

  it("Should be able to read profile by user_id", async () => {
    const { id: user_id } = await createUserUseCase.execute({
      email: "teste@email.com",
      password: "teste",
      name: "Pablo",
    });

    const profile = await showUserProfileUseCase.execute(user_id as string);

    expect(profile).toHaveProperty("id");
    expect(profile).toHaveProperty("password");
    expect(profile.email).toEqual("teste@email.com");
    expect(profile.name).toEqual("Pablo");
  });

  it("Should be not able to read profile by user_id with user donsn't exists", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("Id inexistente");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
