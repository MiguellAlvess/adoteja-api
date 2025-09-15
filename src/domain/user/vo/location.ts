import { City } from "./city.js"
import { State } from "./state.js"

export class Location {
  constructor(
    private city: City,
    private state: State
  ) {}

  static create(city: string, state: string) {
    return new Location(new City(city), new State(state))
  }

  getCity() {
    return this.city.getValue()
  }

  getState() {
    return this.state.getValue()
  }
}
