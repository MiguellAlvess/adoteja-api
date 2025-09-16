import Name from "../vo/name.js"
import { ContactInfo } from "../vo/contact-info.js"
import { Location } from "../vo/location.js"
import UUID from "../vo/uuid.js"
import Email from "../vo/email.js"
import { PhoneNumber } from "../vo/phone-number.js"
import { City } from "../vo/city.js"
import { State } from "../vo/state.js"
import { PasswordHash } from "../vo/password-hash.js"

export default class Account {
  private userId: UUID
  private name: Name
  private contact: ContactInfo
  private location: Location
  private passwordHash: PasswordHash

  constructor(
    userId: string,
    name: string,
    email: string,
    passwordHash: string,
    phone: string,
    city: string,
    state: string
  ) {
    this.userId = new UUID(userId)
    this.name = new Name(name)
    this.contact = new ContactInfo(new Email(email), new PhoneNumber(phone))
    this.location = new Location(new City(city), new State(state))
    this.passwordHash = new PasswordHash(passwordHash)
  }

  static create(
    name: string,
    email: string,
    passwordHash: string,
    phone: string,
    city: string,
    state: string
  ) {
    const userId = UUID.create().getValue()
    return new Account(userId, name, email, passwordHash, phone, city, state)
  }

  getEmail() {
    return this.contact.getEmail()
  }

  getUserId() {
    return this.userId.getValue()
  }

  getName() {
    return this.name.getValue()
  }

  getPassword() {
    return this.passwordHash.getValue()
  }

  getPhone() {
    return this.contact.getPhoneNumber()
  }

  getCity() {
    return this.location.getCity()
  }

  getState() {
    return this.location.getState()
  }
}
