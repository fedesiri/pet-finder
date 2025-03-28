export type ErrorData =
  | Record<string, string | number | boolean | null | undefined>
  | Error;

export abstract class PetFinderError extends Error {
  public code: string;
  public description: string;
  public other_info?: string;

  constructor(input: { message: string; code: string; data?: ErrorData }) {
    super(input.message);
    this.code = input.code;
    this.description = input.message;
    if (input.data) {
      this.other_info = JSON.stringify(input.data);
    }
  }
}
