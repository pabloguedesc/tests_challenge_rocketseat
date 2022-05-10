import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let userRepository: IUsersRepository;
let statementRepository: IStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("GetStatementOperationUseCase", () => {
  beforeEach(async () => {
    userRepository = new InMemoryUsersRepository();
    statementRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(userRepository);
    createStatementUseCase = new CreateStatementUseCase(
      userRepository,
      statementRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      userRepository,
      statementRepository
    );
  });

  it("Shoud be able find a statement", async () => {
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

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string,
    });

    expect(statementOperation.id).toEqual(statement.id);
    expect(statementOperation.user_id).toEqual(user.id);
  });
  it("Shoud not be able find a statement with user donsn't exists", async () => {
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

    expect(async () => {
      const statementOperation = await getStatementOperationUseCase.execute({
        user_id: "teste com usuário inexistente",
        statement_id: statement.id as string,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("Shoud not be able find a statement with statement donsn't exists", async () => {
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

    expect(async () => {
      const statementOperation = await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: "teste com statement inexistente",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
