import { PostedTask, postTasks, RatingToken } from './model';

// --- contract code goes below

// The maximum number of latest tasks the contract returns.
const TASK_LIMIT = 10;

const TOKEN_CONTRACT_ACCOUNT = xxx;

/**
 * Adds a new task under the name of the sender's account id.\
 * NOTE: This is a change method. Which means it will modify the state.\
 * But right now we don't distinguish them with annotations yet.
 */
export function addTask(text: string): void {
  // Creating a new task and populating fields with our data
  const task = new PostedTask(text);
  // Adding the message to end of the the persistent collection
  postTasks.push(task);
}

/**
 * Returns an array of last N tasks.\
 * NOTE: This is a view method. Which means it should NOT modify the state.
 */
export function getTasks(): PostedTask[] {
  const numTasks = min(TASK_LIMIT, postTasks.length);
  const startIndex = postTasks.length - numTasks;
  const result = new Array<PostedTask>(numTasks);
  for(let i = 0; i < numTasks; i++) {
    result[i] = postTasks[i + startIndex];
  }
  return result;
}

//申请者竞标参与任务，index是任务列表序号
export function apply(index: u32): void {
  assert(index < postTasks.length , "Task not exists");
  assert(context.sender != postTasks[index].sender, "Can not apply yourself's task");
  postTasks[index].applicants.push(context.sender);
}

//向某一个申请者帐号转帐并生成RatingToken（调用RatingContract的mint函数）
export function ratingAndTransfer(index:u32, receiver:AccountId, rating:u8, comment:string): void {
  assert(context.sender == postTasks[index].sender, "Only proposer can send!");
  assert(!postTask[index].applicants.include(receiver), "Invalid receiver!");
  let token_id = "comment_" + context.sender + "_" + receiver + index;
  let tokenArgs: TokenArg = { token_id, receiver, comment, rating };
  //TODO sending deposit to receiver
  ContractPromise.create(
    TOKEN_CONTRACT_ACCOUNT, 
    'mint', // target method name
    tokenArgs.encode(), // target method arguments
    25_000_000_000 // gas attached to the call
    // projectBudget             // deposit attached to the call
  );  
}
