import { context, u128, PersistentVector, ContractPromise, ContractPromiseBatch } from "near-sdk-as";
import { PostedTask, postTasks, TokenArg } from './model';
import { AccountId } from "../../utils";

// --- contract code goes below

// The maximum number of latest tasks the contract returns.
const TASK_LIMIT = 10;

const TOKEN_CONTRACT_ACCOUNT: string = 'dev-1234421';

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


export function apply(index: i32): void {
  assert(index < postTasks.length , "Task not exists");
  assert(postTasks[index].finalApplicant == "", "Task is finished");
  assert(context.sender != postTasks[index].sender, "Can not apply yourself's task");
  assert(!postTasks[index].applicants.includes(context.sender), "Can not apply twice");

  //postTasks[index].applicants.push(context.sender);
  const task = postTasks[index];
  task.applicants.push(context.sender);
  postTasks[index] = task;  
}


export function ratingAndTransfer(index:i32, receiver:AccountId, rating:u8, comment:string): void {
  assert(context.sender == postTasks[index].sender, "Only proposer can send!");
  assert(postTasks[index].applicants.includes(receiver), "Invalid receiver!");
  postTasks[index].finalApplicant = receiver;
  //let seq:Number = index;
  let token_id = "comment_" + context.sender + "_" + receiver + "_" + index.toString();
  const tokenArgs: TokenArg = { id: token_id, grantee: receiver, text: comment, rating};
  ContractPromiseBatch.create(receiver).transfer(postTasks[index].balance);
  ContractPromise.create(
    TOKEN_CONTRACT_ACCOUNT, 
    'mint', // target method name
    tokenArgs.encode(), // target method arguments
    25_000_000_000_000 // gas attached to the call
    // projectBudget             // deposit attached to the call
  );  
}
