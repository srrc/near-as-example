import { AccountId } from "../../utils";

@nearBindgen
export class RatingToken {
  constructor(
    id: string,
    grantor: AccountId,
    grantee: AccountId,
    comment: string,
    rating: u8,
    grantDate: i64
  ){}
}
