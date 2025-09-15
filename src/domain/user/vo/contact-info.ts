import Email from "./email.js"
import { PhoneNumber } from "./phone-number.js"

export class ContactInfo {
  constructor(
    private email: Email,
    private phoneNumber: PhoneNumber
  ) {}

  getEmail() {
    return this.email.getValue()
  }

  getPhoneNumber() {
    return this.phoneNumber.getValue()
  }
}
