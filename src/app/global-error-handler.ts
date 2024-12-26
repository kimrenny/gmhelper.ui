import { ErrorHandler, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    if (error.message && error.message.includes('recaptcha__en.js')) {
      return;
    }

    console.error(error);
    this.sendErrorToServer(error);
  }

  private sendErrorToServer(error: any): void {
    // Make the logic for sending an error to the server later.
  }
}
