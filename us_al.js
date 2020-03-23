const request = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');
const utils = require('./utils')

let general = {
    state: "Alabama",
    source: "https://www.alabamapublichealth.gov/infectiousdiseases/2019-coronavirus.html"
}

module.exports.parse = (event, context, callback) => {

    general.timestamp = moment().toString();

    let results = {}

    request(general.source)
        .then(({ data }) => {

            const $ = cheerio.load(data);
            const countyRows = $('.mainContent table tr');
            const counties = [];

            countyRows.each((i, el) => {

                const county = utils.getTemplateObject();

                let columns = $(el).children('td');
                const name = $(columns).eq(0).text().trim().toUpperCase();

                // Extract the last updated date and format to CDT
                if(name.indexOf('UPDATED') >= 0){
                    let upd = utils.extract(name,'UPDATED: ', ' (CT)')
                    upd = upd.replace(/\./g,'');
                    general.updated = moment(upd + ' CDT').toString();
                }

                county.setArea(name);

                if (columns.length == 2 && name !== 'TOTAL' && name !== 'COUNTY OF RESIDENCE') {
                    
                    const confirmed = +$(columns).eq(1).text().trim()
                    county.setCases({con:confirmed});
                    counties.push(county.output());
                }
            })

            general.totals = utils.getTotals(counties)
            results.general = general
            results.counties = counties

            callback(null, results);
        })
        .catch(callback);

};