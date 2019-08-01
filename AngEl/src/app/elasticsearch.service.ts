/****************************************************************
 * ############################################################ *
 * # The contents of this file are not intended as a library. # *
 * # Instead it is most useful as a reference for             # *
 * # elasticsearch-browser methods and data                   # *
 * ############################################################ *
 ****************************************************************/

import { Injectable } from '@angular/core';
import { Client } from 'elasticsearch-browser';
import * as elasticsearch from 'elasticsearch-browser';


/**********************************************************************************
 ***** This interface representes a single hit on an ElasticSearch Query      *****
 ***** It is designed to promise the structure of the data it contains        *****
 ***** with context only for the meta data.                                   *****
 ***** This leaves implementations to apply the context of the data           *****
 ***** with the intent of loosely coupling the stored data to ElasticSearch.  *****
 **********************************************************************************/
export interface Hit {
  _index: String  // The index containing the hit
  _type: String   // The data type of the hit
  _id: String     // The unique identifier of the hit
  _score: Number  // The score ascribed to the relevance of the hit
  _source: {}     // The data contained within the hit
}

/******************************************************************************************
 ***** This class represents a response containing all hits on an ElasticSearch Query *****
 ******************************************************************************************/
export class ESResponse {
  hits: {hits: Hit[]}
}

/**************************************************************
 ***** This class represents a simple ElasticSearch Query *****
 **************************************************************/
export class Query {
  //// PROPERTIES
  from: Number  // QUERY RESPONSE SHOWS 0 INDEXED LIST OF HITS FROM
  size: Number  // HITS [from, from + size)
  query: {
    bool: {
      // QUERY CRITERIA
    }
  }
  sort: [
    // SORT CRITERIA
  ]

  //// CONSTRUCTOR
  /********************************************************
   * Creates a new Query from the data in a QueryBuilder  *
   * @param builder The query builder storing data        *
   *                with which to construct his query     *
   ********************************************************/
  private constructor(builder) {
    this.from = builder.from
    this.size = builder.size
    this.query = {
      bool: { 
        must: builder.must,
        should: builder.should,
        must_not: builder.mustNot
      }
    }
    this.sort = builder.sort
  }

  //// BUILDER
  /******************************************************
   * @return A builder capable of constructing a Query  *
   ******************************************************/
  public static get Builder() {
    class QueryBuilder {
      //// PROPERTIES
      private from: Number
      private size: Number
      private must: any[]
      private should: any[]
      private mustNot: any[]
      private sort: any[]

      //// CONSTRUCTOR
      /**********************************************************
       * Creates a new query builder with defaults              *
       * from = 0                                               *
       * size = 10                                              *
       * sort = _score                                          *
       * and no fields to match.                                *
       * This matches the behavior of a default Elastic search. *
       **********************************************************/
      public constructor() {
        this.from = 0
        this.size = 10
        this.must = []
        this.should = []
        this.mustNot = []
        this.sort = ["_score"]
      }

      //// METHODS
      /**************************************************
       * Adds the given list of key value pairs         *
       * to the list of fields the response MUST MATCH. *
       * @param fields The list of key value pairs      *
       **************************************************/
      public mustMatch(fields: {[key: string]: any}[]): QueryBuilder {
        this.must = this.must.concat(fields)
        return this
      }
      
      /****************************************************
       * Adds the given list of key value pairs           *
       * to the list of fields the response SHOULD MATCH. *
       * @param fields The list of key value pairs        *
       ****************************************************/
      public shouldMatch(fields: {[key: string]: any}[]): QueryBuilder {
        this.should = this.should.concat(fields)
        console.log("----SHOULD---\n" + this.should)
        return this
      }
      
      /******************************************************
       * Adds the given list of key value pairs             *
       * to the list of fields the response MUST NOT MATCH. *
       * @param fields The list of key value pairs          *
       ******************************************************/
      public mustNotMatch(fields: {[key: string]: any}[]): QueryBuilder {
        this.mustNot = this.mustNot.concat(fields)
        return this
      }

      /************************************************************
       * Adds a new field to sort the response by                 *
       * with a higher priority than all previously added fields. *
       * @param field The name of the field to sort by            *
       * @param order The order in which it sort                  *
       *              Expects "asc" for ascending                 *
       *                   or "desc" for descending               *
       * @return This builder                                     *
       ************************************************************/
      public sortHits(field: string, order: string): QueryBuilder {
        this.sort.unshift({[field]: order})
        return this
      }

      /**********************************************************
       * Sets the index of the first hit to return, inclusive.  *
       * @param from The index of the first value, inclusive    *
       * @return This builder                                   *
       **********************************************************/
      public fromHit(from: Number): QueryBuilder {
        this.from = from
        return this
      }
      
      /**************************************************
       * Sets the number of hits to display.            *
       * @param num The number of hits to display       *
       *            (Default MAX in Elastic is 10,000)  *
       * @return This builder                           *
       **************************************************/
      public numHits(num: Number): QueryBuilder {
        this.size = num
        return this
      }

      /********************************************************
       * Mutates terms such that each key value pair          *
       * becomes wrapped as the value of a new key value pair *
       * with the key being "match".                          *
       * NOTE: Input type as {string: any}. Although queries  *
       * are intended to be {String: String}. This was done   *
       * to save copying the data by allowing mutation        *
       * @param terms A list of key value pairs               *
       * @return the mutated list of terms                    *
       ********************************************************/
      private matchWrap(terms: {[key: string]: any}[]) {
        for (let i = 0; i < terms.length; i++) {
          terms[i] = {match: terms[i]}
        }
        return terms
      }

      /**********************************************
       * Returns a built Query with all input data  *
       * By default the query hits on all files and *
       * shows the first 10                         *
       **********************************************/
      public build(): Query {
        this.must = this.matchWrap(this.must)
        this.should = this.matchWrap(this.should)
        this.mustNot = this.matchWrap(this.mustNot)
        return new Query(this)
      } 
    }
    return QueryBuilder
  }
}

/************************************************************************************
 ***** This class repesents a service for interacting with an ElasticSearch DB  *****
 ***** To utilize, inject it into the constructor of the requiring component    *****
 ************************************************************************************/
@Injectable({
  providedIn: 'root'
})
export class ElasticsearchService {
  //// PROPERTIES
  private DBURL = 'http://localhost:9200'       // The URL of the Elastic DB (DEFAULT: Local)
  private client: Client;                       // The connected DB. Used to send queries
 
  //// CONSTRUCTOR
  /**************************************************
   * Construct a new ElasticSearch Service.         *
   * If the client does not yet exist, connect one  *
   **************************************************/
  constructor() {
    if (!this.client) {
      this._connect();
    }
  }
 
  //// METHODS
  /***************************************************
   * Unused method to connect a DB Client.           *
   * Appears to be less specific version of _connect *
   ***************************************************/
  private connect() {
    this.client = new Client({
      host: this.DBURL,
      log: 'trace'
    });
  }
 
  /****************************************************************
   * Creates a new DB Client and connects to it with a stored URL *
   ****************************************************************/
  private _connect() {
    this.client = new elasticsearch.Client({
      host: this.DBURL,
      log: 'trace'
    });
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

  /****************************************************************************
   * Sends a search request to the DB asking for hits described by the query  *
   * //FIXME The behavior is undefined for incorrectly formatted querries     *
   * @param index The index on which to perform the query                     *
   * @param query A basic query capable of searching for and sorting          *
   *           a number of hits in a database based on stored                 *
   *           selection and sorting criteria with matching key value pais    *
   * @return A promise of DB response                                         *
   ****************************************************************************/
  public search(index: String, query: Query): Promise<ESResponse> {
    return this.client.search({
      index: index,
      body: query
    });
  }

  /************************************************
   * Adds an index with the given name to the DB. *
   * //FIXME Crashes on existing index            *
   * @param index the name of the index to add    *
   ************************************************/
  public addIndex(index: String) {
    this.client.indices.create({index: index});
  }

  /****************************************************
   * Deletes an index with the given name to the DB.  *
   * //FIXME Crashes on no existing index             *
   * @param index the name of the index to delete     *
   ****************************************************/
  public delIndex(index: String) {
    this.client.indices.delete({index: index});
  }

  /**************************************************************************
   * Updates, or creates if none exists, a document with the given docID    *
   * storing the given body of data within the given index.                 *
   * //FIXME undefined behavior for non existent index and extranious docID *
   * @param index The index in which to store the document                  *
   * @param docID The ID of the document to upate or create.                *
   * @param body The body of data to be stored in the document.             *
   **************************************************************************/
  public putDoc(index: String, docID: String, body: {}) {
    this.client.index({
      index: index,
      type: "_doc",
      id: docID,
      body: body
     })
  }

  /******************************************************************
   * Deletes the document with the given docID in the given index.  *
   * //FIXME undefined behavior for non existent index and docID    *
   * @param index The name of the index storing the document        *
   * @param docID The name of the document to be deleted            *
   ******************************************************************/
  public delDoc(index: String, docID: String) {
    this.client.delete({
      index: index,
      type: "_doc",
      id: docID
     })
  }
}