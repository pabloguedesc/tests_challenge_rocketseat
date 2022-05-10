import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let statementRepository: IStatementsRepository;
let usersRepository: IUsersRepository;
let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("CreateStatemanteUseCase", () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    getBalanceUseCase = new GetBalanceUseCase(
      statementRepository,
      usersRepository
    );
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementRepository
    );
  });

  it("Should be able to deposit amount", async () => {
    const user = await createUserUseCase.execute({
      name: "teste",
      email: "teste@email.com",
      password: "teste",
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 200,
      description: "teste",
      type: OperationType.DEPOSIT,
    });

    expect(statement).toHaveProperty("id");
    expect(statement).toHaveProperty("user_id");
    expect(statement.user_id).toEqual(user.id);
    expect(statement.type).toEqual("deposit");
  });

  it("Should be able to withdraw amount", async () => {
    const user = await createUserUseCase.execute({
      name: "teste",
      email: "teste@email.com",
      password: "teste",
    });

    const statementDeposit = await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 200,
      description: "teste deposit",
      type: OperationType.DEPOSIT,
    });

    const statementWithdraw = await createStatementUseCase.execute({
      amount: 150,
      user_id: user.id as string,
      description: "teste withdraw",
      type: OperationType.WITHDRAW,
    });

    const balanceUser = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(statementWithdraw).toHaveProperty("id");
    expect(statementWithdraw).toHaveProperty("user_id");
    expect(statementWithdraw.user_id).toEqual(user.id);
    expect(statementWithdraw.type).toEqual("withdraw");

    expect(balanceUser.balance).toEqual(
      statementDeposit.amount - statementWithdraw.amount
    );
  });

  it("Should be not able to deposito with user not exist", async () => {
    expect(async () => {
      const statement = await createStatementUseCase.execute({
        amount: 150,
        user_id: "xxxxxxxx",
        description: "teste withdraw",
        type: OperationType.DEPOSIT,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should be not able to depositot with amount < balance", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "teste",
        email: "teste@email.com",
        password: "teste",
      });

      const statementDeposit = await createStatementUseCase.execute({
        user_id: user.id as string,
        amount: 100,
        description: "teste deposit",
        type: OperationType.DEPOSIT,
      });

      const statementWithdraw = await createStatementUseCase.execute({
        amount: 150,
        user_id: user.id as string,
        description: "teste withdraw",
        type: OperationType.WITHDRAW,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
