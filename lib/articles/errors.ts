export class ArticleError extends Error {
  readonly code: "UNAUTHENTICATED" | "NOT_FOUND" | "CONFLICT" | "INVALID";
  constructor(code: ArticleError["code"], message: string) {
    super(message);
    this.name = "ArticleError";
    this.code = code;
  }
}
