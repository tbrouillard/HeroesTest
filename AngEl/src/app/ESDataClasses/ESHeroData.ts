/********************************************************************************
 * This class represents the data format of a HeroFile in an ElasticSearch DB.  *
 ********************************************************************************/
export class ESHeroFile {
  readonly _index: string  // The index containing the hit
  readonly _type: string   // The data type of the hit
  readonly _id: string     // The unique identifier of the hit
  readonly _score: number  // The score ascribed to the relevance of the hit
  readonly _source: {      // The data contained within the hit
    readonly heroID: number
    readonly name: string
    readonly alias: string
    readonly quirk: string
    readonly rank: number
  }
}

/********************************************************************************************************
 * This class represents the data format of an ElasticSearch query response containing ESHeroFile data  *
 ********************************************************************************************************/
export class ESHeroResponse {
  readonly hits: 
  {
    readonly hits: Array<ESHeroFile>
  }
}