export interface GetProblemsQuery {
  pageLen: number; // How many results to show per page
  page: number; // Page number
  user: string | undefined; // Query the problem status for an specific user if desired
  filter: "all" | "accepted" | "tried";
}

export interface SearchProblemsQuery {
  problemName: string;
  pageLen: number;
  page: number;
  user: string | undefined;
}
