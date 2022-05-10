import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let userRepository: IUsersRepository;
let statementRepository: IStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("GetBalanceUseCase", () => {
  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    statementRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(userRepository);
    createStatementUseCase = new CreateStatementUseCase(
      userRepository,
      statementRepository
    );
    getBalanceUseCase = new GetBalanceUseCase(
      statementRepository,
      userRepository
    );
  });

  it("Should be able read balance of the user", async () => {
    const user = await createUserUseCase.execute({
      name: "teste",
      email: "teste@email.com",
      password: "123456",
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 200,
      description: "teste",
      type: OperationType.DEPOSIT,
    });

    const balanceUser = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(balanceUser.balance).toEqual(200);
    expect(balanceUser.statement[0].id).toEqual(statement.id);
  });

  it("Should be not able read balance with user dosens't exists", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "teste de erro" });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
