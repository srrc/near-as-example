import { context, u128, PersistentVector } from "near-sdk-as";
import { AccountId } from "../../utils.ts";

@nearBindgen
export class RatingToken {
  id: string;
  grantor: AccountId;
  grantee: AccountId;
  comment: string;
  rating: u8;
  grantDate: Date;
}

export class TokenArg {
  id: string;
  grantee: AccountId;
  text: string;
  rating: u8;
}

export class RatingContract {
  private owner: AccountId;
  private tokens_per_owner: PersistentMap<AccountId, PersistentSet<string>> = new PersitentMap("tpo");
  private tokens_by_id: PersistentMap<string, RatingToken> = new PersistentMap("ti");
  
  mint(token_id: string, grantee: AccountId, text: string, rating: u8): void {
    const ratingToken = this.tokens_by_id.get(token_id);
    if (ratingToken) {
      throw new Error('token already exist');
    }
    
    const caller = context.sender();
    let token = new RatingToken(token_id, caller, grantee, text, rating, Date.now());
    this.tokens_by_id.set(token_id, token);
    const granteeUser = this.tokens_per_owner.get(grantee);
    if (!granteeUser) {
      this.tokens_per_owner.set(grantee, new PersistentSet<string>());
    }
    
    this.tokens_per_owner.get(grantee).push(token_id);
    logging.log('RatingToken ${token_id} granted from ${caller} to ${grantee}');
  }
  
  //查看user所有的RatingToken
  getUserRatingTokens(user: AccountId): Array<RatingToken> {
    const tokens = this.tokens_per_owner.get(user);
    if (!tokens) {
      return new Array<RatingToken>();
    } else {
      return tokens;
    }
  }
}


