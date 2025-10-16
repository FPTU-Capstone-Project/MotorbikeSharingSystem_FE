import { apiFetch,PageResponse} from "../utils/api";
import { TransactionVerification } from "../types";
 
export async function fetchAllTransaction(page :number=0,size:number=10):Promise<PageResponse<TransactionVerification>>{
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('size', String(size));
  query.set('sortBy', 'txn_id');
  query.set('sortDir', 'desc');
 
  return apiFetch<PageResponse<TransactionVerification>>(`/transaction/all?${query.toString()}`);
}