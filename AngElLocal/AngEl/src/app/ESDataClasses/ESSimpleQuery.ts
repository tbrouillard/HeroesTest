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