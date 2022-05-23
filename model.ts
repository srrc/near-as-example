import { context, u128, PersistentVector } from "near-sdk-as";
import { AccountId } from "../../utils.ts";

/** 
 * Exporting a new class PostedTask so it can be used outside of this file.
 */
@nearBindgen
export class PostedTask {
  msg: string;
  balance: u64;
  createdAt: Date;
  sender: AccountId;
  applicants: Array<AccountId>;
  
  constructor(public msg: string) {
    this.msg = msg;
    this.balance = context.attachedDeposit;
    this.sender = context.sender;
    this.createdAt = Date.now();
    this.applicants = new Array<AccountId>();
  }
}

/**
 * collections.vector is a persistent collection. Any changes to it will
 * be automatically saved in the storage.
 * The parameter to the constructor needs to be unique across a single contract.
 * It will be used as a prefix to all keys required to store data in the storage.
 */
export const postTasks = new PersistentVector<PostedTask>("t");
