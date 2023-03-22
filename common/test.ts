import { expect } from "chai";

export async function expectThrowsAsync(method: () => Promise<any>, errorMessage: string) {
  let error: any = null;
  try {
    await method();
  } catch (err) {
    error = err;
  }
  expect(error).an("Error");
  if (errorMessage) {
    expect(error?.message).equal(errorMessage);
  }
}

export function vmEsceptionText(text: string) {
  return `VM Exception while processing transaction: reverted with reason string '${text}'`;
}

export function revertedEsceptionText(text: string) {
  return `execution reverted: ${text}`;
}

export function errorHandler(error: object, message: string) {
  if ("reason" in error) {
    expect(error.reason).eq(revertedEsceptionText(message));
  } else if ("message" in error) {
    expect(error.message).eq(vmEsceptionText(message));
  }
}

export function getNow() {
  return Math.round(new Date().getTime() / 1000);
}
