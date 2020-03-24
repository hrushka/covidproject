const request = require('axios')
const moment = require('moment')
const cheerio = require('cheerio')
const utils = require('../utils')

let general = {
    state: "Illinois",
    source: "http://www.dph.illinois.gov/topics-services/diseases-and-conditions/diseases-a-z-list/coronavirus"
}

const urls = {
    main: 'http://www.dph.illinois.gov/topics-services/diseases-and-conditions/diseases-a-z-list/coronavirus',
    data: 'http://www.dph.illinois.gov/sites/default/files/COVID19/[[data_file]].json'
}

module.exports.parse = (event, context, callback) => {

    general.timestamp = moment().toString();

    let results = {}
    let counties = [];

    request(urls.main)
        .then(({ data }) => {

            const data_file = utils.extract(data, "files/COVID19/", ".json', ")
            const data_url = urls.data.replace('[[data_file]]', data_file)

            request(data_url)
                .then(({ data }) => {
                    const records = data.characteristics_by_county.values

                    records.forEach(d => {

                        const county = utils.getTemplateObject();
                        county.setArea(d.County);
                        county.setCases({
                            con: d.confirmed_cases,
                            dea: d.deaths
                        });
                        county.setTests({
                            pos: d.conconfirmed_cases,
                            neg: d.negative
                        })

                        counties.push(county.output())

                    })

                    general.totals = utils.getTotals(counties)
                    results.general = general
                    results.counties = counties

                    console.log(results)

                    callback(null, results);
                })

        })
        .catch(callback);

};