import { context, u128, logging, PersistentMap } from "near-sdk-as";
import { RatingToken } from './model';
import { AccountId } from "../../utils";


export class RatingContract {
  //private owner: AccountId;
  private tokens_per_owner: PersistentMap<AccountId, Array<string>> = new PersistentMap("tpo");
  private tokens_by_id: PersistentMap<string, RatingToken> = new PersistentMap("ti");
  
  mint(token_id: string, grantee: AccountId, text: string, rating: u8): void {
    const ratingToken = this.tokens_by_id.get(token_id);
    if (ratingToken) {
      throw new Error('token already exist');
    }
    
    const caller = context.sender;
    let token = new RatingToken(token_id, caller, grantee, text, rating, Date.now());
    this.tokens_by_id.set(token_id, token);
    const granteeUser = this.tokens_per_owner.get(grantee);
    if (!granteeUser) {
      this.tokens_per_owner.set(grantee, new Array<string>());
    }
    
    let user = this.tokens_per_owner.get(grantee) as Array<string>;
    user.push(token_id);
    logging.log('RatingToken ${token_id} granted from ${caller} to ${grantee}');
  }
  
  getUserRatingTokens(user: AccountId): Array<RatingToken> {
    const tokens = this.tokens_per_owner.get(user);
    let tokenArray = new Array<RatingToken>();
    if (!!tokens) {
      for (let i=0; i<tokens.length; i++) {
        const tk = this.tokens_by_id.get(tokens[i])
        if (!!tk) {
          tokenArray.push(tk);
        }
      }
    }
    
    return tokenArray;
  }
}


