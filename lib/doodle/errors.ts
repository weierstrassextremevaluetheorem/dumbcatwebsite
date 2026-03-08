export class PromptValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PromptValidationError";
  }
}

export class DoodleProviderConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DoodleProviderConfigError";
  }
}

