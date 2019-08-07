import { Injectable } from '@angular/core';

import { Client } from 'elasticsearch-browser';
import * as elasticsearch from 'elasticsearch-browser';

import { ESHeroFile, ESHeroResponse } from './ESDataClasses/ESHeroData';
import { HeroFile } from './heroFile'
import * as herofile from './heroFile'
import { Query } from './ESDataClasses/ESSimpleQuery';
import { of } from 'rxjs/internal/observable/of';
import { Observable } from 'rxjs/internal/Observable';
import { delay } from 'q';

/************************************************************
 * This class represents an injectable service capable of   *
 * communicating with an ElasticSearch Data Base to         *
 * store, modify, and read hero data,                       *
 * giving the data the outward presentation of a HeroFile.  *
 ************************************************************/
@Injectable({
  providedIn: 'root'
})
export class ESHeroService {
  //// PROPERTIES
  private client: Client;                       // The connected DB. Used to send queries
  private heroIndex: String = "heroes"          // The index in which hero data is stored
  private metaIndex: String = "heroesmeta"      // The index in which hero DB meta data is stored

  
  private DBURL = 'localhost'        // The URL of the Elastic DB (DEFAULT: Local)
  private DBPORT = '9200'
  private uname: String = "elastic"
  private pword: String = "q5s8xcrv7pg5znh9jq7jptkb"

  private selectedHero: HeroFile                // The currently selected hero being manipulated within the app

  private page: number = 1
  private size: number = 10
  private sort: string = "rank" // TODO
  private sortDir: string = "asc"
  private searchFor: string = ""

  /**************************************************
   * Construct a new ElasticSearch Service.         *
   * If the client does not yet exist, connect one  *
   **************************************************/
  constructor() {
    if (!this.client) {
      this._connect();
    }
  }

  // TODO
  public updateSort(sort: string) {
    // If the same sort method is clicked, switch the sort direction
    if (this.sort == sort) {
      this.sortDir = (this.sortDir == "asc")? "desc" : "asc"
    // If a different one is clicked switch to that sort ascending
    } else {
      this.sortDir = "asc" 
      this.sort = sort
    }
  }

  public async pageUp(currentListSize: number) {
    if (currentListSize >= this.size) {  // Not perfect. can go to empty next if this page is full
      this.page++
    }
  }

  public pageDown() {
    if (this.page > 1) {
      this.page--
    }
  }

  public searchTerm(value: string) {
    this.searchFor = value.trim()
    this.page = 1
  }

  public getPage() {
    return this.page
  }
  // TODO
 
  /****************************************************************
   * Creates a new DB Client and connects to it with a stored URL *
   ****************************************************************/
  private _connect() {
    this.client = new elasticsearch.Client({
      host: {
        host: this.DBURL,
        port: this.DBPORT,
        // headers: {
        //   'Access-Control-Allow-Origin': "*"
        // }
      },
      // httpAuth: this.uname + ":" + this.pword,
      log: 'trace'
    });
    // TODO IF INDECIS DONT EXIST CREATE THEM AND INIT META DATA
  }

  /********************************************************
   * Adds a new hero with a given name, alias, and quirk. *
   * Ensures unique alias.                                *
   * //FIXME MAKE SURE ALL SUCCEED OR FAIL                *
   * //FIXME Should return the result e g boolean         *
   * @param name The name of the new hero                 *
   * @param alias The alias of the new hero               *
   * @param quirk The quirk of the new hero               *
   ********************************************************/
  public async addHero(name: string, alias: string, quirk: string) {
    // Make sure the alias is unique
    let valid = await this.validHeroData(alias)
    if (valid) {
      // 
      let nextID: number = await this.getMetaData("nextID")
      await this.putMetaData("nextID", nextID + 1)
      let result = await this.client.index({
        index: this.heroIndex,
        type: "_doc",
        // id: docID, GENERATE DOCUMENT ID
        body: {
          heroID: nextID,
          name: name,
          alias: alias,
          quirk: quirk,
          rank: herofile.UNRANKED
        }
      })
    }
  }

  /****************************************************************
   * Deletes the given hero file using its reference.             *
   * Shifts files with rank value >= to the file's rank           *
   * down in value tp fill the vacancy.                           *
   * //FIXME Crash on non existent file reference.                *
   * //FIXME Vulnerable to falsified input                        *
   * //FIXME Ensure all elements successful or fail               *
   * //FIXME Should return the result e g boolean                 *
   * @param file The hero file intended to be deleted from the DB *
   ****************************************************************/
  public async delHero(file: HeroFile) {
    this.client.delete({
      index: this.heroIndex,
      type: "_doc",
      id: file.reference
     })
     this.shiftRanksBelow(file.rank, "down",)
  }

  /**********************************************************
   * Updates a given hero file based on optional inputs for *
   * the heroes name, alias, quirk, and rank.               *
   * Does not allow duplicate aliases.                      *
   * Shifts ranks with value >= newRank up in value.        *
   * //FIXME Crash on non existent file reference.          *
   * //FIXME Vulnerable to falsified input                  *
   * //FIXME Ensure all elements successful or fail         *
   * //FIXME Should return the result e g boolean           *
   * @param oldFile The old hero file to be updated         *
   * @param newName An optional new name                    *
   * @param newAlias An optional new alias                  *
   * @param newQuirk An optional new quirk                  *
   * @param newRank An optional new rank                    *
   **********************************************************/
  public async editHero(oldFile: HeroFile, newName?: string,
                                           newAlias?: string, 
                                           newQuirk?: string, 
                                           newRank?: number) {
    // If it has a new alias
    if (newAlias) {
      // Check that the alias is unique
      let valid = await this.validHeroData(newAlias)
      if (!valid) {
        return false
      }
    }


    let nextRank = await this.getMetaData("nextRank")
    let newFile = new HeroFile(
      oldFile.reference, 
      oldFile.heroID,
      (newName) ? newName : oldFile.name,
      (newAlias) ? newAlias : oldFile.alias,
      (newQuirk) ? newQuirk : oldFile.quirk,
      (newRank && (newRank > 0 && newRank <= nextRank || newRank === herofile.UNRANKED)) ? newRank : oldFile.rank
    )

    // If the rank is changing
    if (newFile.rank != oldFile.rank) {
      // If the new is ranked
      if (newFile.rank != herofile.UNRANKED) {
        // If the old is ranked
        if (oldFile.rank != herofile.UNRANKED) {
          // Remove by closing old and opening new
          await this.shiftRanksBelow(oldFile.rank, "down")
          await delay(1000)
          await this.shiftRanksBelow(newFile.rank, "up")
          await delay(1000)
        // If UNRANKED -> RANKED
        } else {
          await this.shiftRanksBelow(newFile.rank, "up")
        }
      // If RANKED -> UNRANKED
      } else {
        await this.shiftRanksBelow(oldFile.rank, "down")
      }
    }

    // Store the update
    await this.client.index({
      index: this.heroIndex,
      type: "_doc",
      id: newFile.reference,
      body: {
        heroID: newFile.heroID,
        name: newFile.name,
        alias: newFile.alias,
        quirk: newFile.quirk,
        rank: newFile.rank
      }
     })
  }

  /********************************************************************
   * Returns a single hero file with the given reference.             *
   * //FIXME Crashes on non existent file                             *
   * @param reference The unique identifier of the desired hero file  *
   ********************************************************************/
  public async getHero(reference: String): Promise<HeroFile> {
    let response: ESHeroFile = await this.client.get({
      index: this.heroIndex,
      type: "_doc",
      id: reference
    })
    return this.ESHeroFile2HeroFile(response)
  }

  /**************************************************************************************
   * Returns a page of heroes from the data base in the form of a list                  *
   * sorted by a given field in a given direction with entries ((page - 1) * ofSize).   *
   * //FIXME Verify direction and sizes                                                 *
   * // TODO
   **************************************************************************************/
  public async getHeroPage(): Promise<HeroFile[]> {
    // Get the page of hero files
    let shouldMatch = []
    if (this.searchFor) {
      shouldMatch.push({"alias": this.searchFor})
      shouldMatch.push({"name": this.searchFor}) 
      shouldMatch.push({"quirk": this.searchFor})
      if (!isNaN(Number(this.searchFor))) {
        shouldMatch.push({"rank": this.searchFor})
        shouldMatch.push({"heroID": this.searchFor})
      }
    }
    let query = 
    (new Query.Builder)
    .fromHit((this.page - 1) * this.size)
    .numHits(this.size)
    .sortHits(this.sort, this.sortDir)
    .shouldMatch(shouldMatch)
    .build()
    let response: ESHeroResponse = await this.search(this.heroIndex, query)

    // Format each hero files data to HeroFiles and return them
    let heroes: HeroFile[] = []
    response.hits.hits.forEach(element => 
      {
        heroes.push(this.ESHeroFile2HeroFile(element))
      }
    );
    return heroes;
  }

  // TODO
  public selectHero(hero: HeroFile) {
    this.selectedHero = hero
  }

  // TODO
  public getSelectedHero(): Observable<HeroFile> {
    return of(this.selectedHero)
  }

  /******************************************************
   * Ping the client with the message                   *
   * "hello, ElasticSearch is up and running".          *
   * Returns the client response indicating the status  *
   * of the connection.                                 *
   * @return The result of the ping                     *
   *****************************************************/
  isAvailable(): any {
    return this.client.ping({
      requestTimeout: Infinity,
      body: 'hello, ElasticSearch is up and running!'
    });
  }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /****************************************************************************
   * Sends a search request to the DB asking for hits described by the query  *
   * //FIXME The behavior is undefined for incorrectly formatted querries     *
   * @param index The index on which to perform the query                     *
   * @param query A basic query capable of searching for and sorting          *
   *           a number of hits in a database based on stored                 *
   *           selection and sorting criteria with matching key value pais    *
   * @return A promise of DB hero data response (JSON) Object                 *
   ****************************************************************************/
  private search(index: String, query: Query): Promise<ESHeroResponse>{
    return this.client.search({
      index: index,
      body: query
    });
  }

  /**************************************************************************
   * Reformats an ElasticSearch formatted her file to a standard HeroFile.  *
   * @param eshf An ElasticSearch formatted HeroFile                        *
   * @return The given file reformatted to a standard HeroFile              *
   **************************************************************************/
  private ESHeroFile2HeroFile(eshf: ESHeroFile): HeroFile {
    return new HeroFile(
      eshf._id,
      eshf._source.heroID,
      eshf._source.name,
      eshf._source.alias,
      eshf._source.quirk,
      eshf._source.rank)
  }

  /****************************************************************************************
   * Shifts all ranks greater than or equal to the given rank by 1 in a given direction.  *
   * //FIXME Does not finsh all files if one fails                                        *
   * //FIXME Verify direction                                                             *
   * @param rank The rank used to compare for all >= by value                             *
   * @param direction The direction in which to shift, "up", or "down".                   *
   *                  Others default to "up"                                              *
   *                  "down" lowers value, increasing perceived rank,                     *
   *                  "up" raises value, decreasing perceived rank                        *
   ****************************************************************************************/
  private shiftRanksBelow(rank:  number, direction: string) {
    if (rank != herofile.UNRANKED) {
      this.client.updateByQuery({
        index: this.heroIndex,
        type: "_doc",
        body: {
          script: {
            "source": "ctx._source.rank" + ((direction == "down") ? "--" : "++"),
            "lang": "painless"
          },
          query: {
            bool: {
              must_not: [
                {match: {"rank": herofile.UNRANKED}}
              ],
              must: [
                {range: {"rank": {gte: rank}}}
              ]
            }
          }
        }
      })
    }
  }

  /********************************************************************
   * Determines whether or not new hero data is valid to add or edit  *
   * based on the following criteria:                                 *
   * - There are no existing heroes with the same Alias               *
   * @param alias The alias to check for uniqueness                   *
   * @return Whether or not all criteria are verified as true         *
   ********************************************************************/
  private async validHeroData(alias: string): Promise<boolean> {
    let valid = true
    // Check for uniqueness
    if (alias != herofile.UNKNOWN) {
      let query: Query =
      (new Query.Builder)
      .shouldMatch([{"alias": alias}])
      .build()
      let result: ESHeroResponse = await this.search(this.heroIndex, query)
      valid = valid && result.hits.hits.length === 0
    }
    return valid
  }

  /****************************************************************
   * Retrieves a value of stored meta data based on a given key.  *
   * @param key The key of the meta data                          *
   * @return The retrieved value                                  *
   ****************************************************************/
  private async getMetaData(key: string): Promise<number> {
    let response = await this.client.get({
      index: this.metaIndex,
      type: "_doc",
      id: key
    })
    return response._source[key]
  }

  /**********************************************************************
   * Stores a given key value pair as meta data for the hero documents. *
   * @param key The key of the meta data                                *
   * @param value The value of the meta data                            *
   * @return Whether or not storing the data was successful             *
   **********************************************************************/
  private async putMetaData(key: string, value): Promise<boolean> {
    // build the query to store the key value pair in a document
    let body = {body: {}}
    body.body[key] = value
    // Store the data in a document with a name matching the key
    let result = await this.client.index({
      index: this.metaIndex,
      type: "_doc",
      id: key,
      body
    })
    if (result.result == "updated" || result.result == "created") {
      return true
    } else {
      return false
    }
  }
}