import Name from "../vo/name.js"
import { ContactInfo } from "../vo/contact-info.js"
import { Location } from "../vo/location.js"
import { Password } from "../vo/password.js"
import UUID from "../vo/uuid.js"
import Email from "../vo/email.js"
import { PhoneNumber } from "../vo/phone-number.js"
import { City } from "../vo/city.js"
import { State } from "../vo/state.js"

export default class User {
  private userId: UUID
  private name: Name
  private contact: ContactInfo
  private location: Location
  private password: Password

  constructor(
    userId: string,
    name: string,
    email: string,
    password: string,
    phone: string,
    city: string,
    state: string
  ) {
    this.userId = new UUID(userId)
    this.name = new Name(name)
    this.contact = new ContactInfo(new Email(email), new PhoneNumber(phone))
    this.location = new Location(new City(city), new State(state))
    this.password = new Password(password)
  }

  static create(
    name: string,
    email: string,
    password: string,
    phone: string,
    city: string,
    state: string
  ) {
    const userId = UUID.create().getValue()
    return new User(userId, name, email, password, phone, city, state)
  }
}
