/** The value for an unknown legal name, hero name, or quirk name */
export const UNKNOWN: string = "???"
/** The value for an unlicensed license / identification number */
export const UNLICENSED: number = -1
/** The value for an unranked rank */
export const UNRANKED: number = 1000

/**********************************************************
 * This class represents a file containing data on a hero *
 **********************************************************/
export class HeroFile {
  readonly reference: string  // The unique identifier for the file. INVARIANT: Unique
  readonly heroID: number     // The hero's license number, UNLICENSED if none. INVARIANT: Unique
  readonly name: string       // The hero's legal name, UNKNOWN if unknown.
  readonly alias: string      // The hero's hero name, UNKNOWN if unknown. INVARIANT: Unique
  readonly quirk: string      // The hero's quirk name, UNKNOWN if unknown.
  readonly rank: number       // The hero's numeric ranking out of all heroes, UNRANKED if none. INVARIANT: Unique, [1, Infinity)

  constructor(
    reference: string,
    heroID: number,
    name: string,
    alias: string,
    quirk: string,
    rank: number) {
      this.reference = reference;
      this.heroID = heroID;
      this.name = name;
      this.alias = alias;
      this.quirk = quirk;
      this.rank = rank;
  }
}