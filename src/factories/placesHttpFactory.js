const { default: wretch } = require('wretch')
const { dedupe } = require('wretch-middlewares')
const configFactory = require('./configFactory')
const {
    LANGUAGE_MAPPINGS
} = require('../constants')

const BASE_URL = 'https://maps.googleapis.com/maps/api/place'

let placesHttp = wretch(BASE_URL)
    .middlewares([
        dedupe()
    ])

module.exports = {
    init(httpOptions = {}) {
        const config = configFactory.get()

        wretch().polyfills({
            fetch: httpOptions.mock || require('node-fetch')
        })
        placesHttp = placesHttp.query({
            key: config.apiKey
        })
    },
    nearbySearch: async ({ location, name, rankby='prominence', radius=50000 } = {}) => {
        const config = configFactory.get()
        const query = {
            location,
            radius,
            name,
            rankby,
            language: LANGUAGE_MAPPINGS[config.locale]
        }

        const request = placesHttp.url('/nearbysearch/json').query(query)
        console.log(request.url)

        const results = await request
            .get()
            .json()
            .catch(error => {
                // Network error
                if (error.name === 'TypeError')
                    throw new Error('APIRequest')
                // Other error
                throw new Error('APIResponse')
            })

        return results
    },
    getDetails: async (placeId) => {
        const config = configFactory.get()
        const query = {
            placeid: placeId,
            region: config.currentRegion,
            language: LANGUAGE_MAPPINGS[config.locale]
        }

        const results = await placesHttp
            .url('/details/json')
            .query(query)
            .get()
            .json()
            .catch(error => {
                // Network error
                if (error.name === 'TypeError')
                    throw new Error('APIRequest')
                // Other error
                throw new Error('APIResponse')
            })

        return results
    }
}