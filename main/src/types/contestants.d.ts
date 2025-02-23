export interface ContestantActivity {
  date: string;
  numberOfSubmissions: number;
}

export interface GetContestantsQuery {
  pageLen: number; // How many results to show per page
  page: number; // Page number
  user: string; // User who is logged in (should obtain this from request in a future)
  filter: "all" | "friends";
}

export interface SearchContestantQuery {
  handle: string;
  pageLen: number; // How many results to show per page
  page: number; // Page number
  user: string; // User who is logged in (should obtain this from request in a future)
}
