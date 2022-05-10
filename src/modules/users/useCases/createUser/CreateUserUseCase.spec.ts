import bcrypt from "bcryptjs";

import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let usersRepository: IUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("Should be able to create user", async () => {
    const user = await createUserUseCase.execute({
      name: "Pablo",
      email: "pabloguedesc@email.com",
      password: "pablo123",
    });

    expect(user).toHaveProperty("id");
    expect(user.name).toEqual("Pablo");
    expect(user.email).toEqual("pabloguedesc@email.com");
  });

  it("Should be not able to create user with same email", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "Pablo",
        email: "pabloguedesc@email.com",
        password: "pablo123",
      });

      await createUserUseCase.execute({
        name: "Pablo2",
        email: "pabloguedesc@email.com",
        password: "pablo321",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
