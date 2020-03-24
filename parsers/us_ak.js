const request = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');
const utils = require('../utils')

let general = {
    state: "Alaska",
    source: "http://dhss.alaska.gov/dph/Epi/id/Pages/COVID-19/monitoring.aspx"
}

module.exports.parse = (event, context, callback) => {

    general.timestamp = moment().toString();

    let results = {}

    request(general.source)
        .then(({ data }) => {

            const $ = cheerio.load(data);
            const countyRows = $('div.grid2 table tr');
            
            let upd = $('div.grid2 .dz-Element-p').text().trim();
            if(upd !== undefined){
                upd = utils.extract(upd, 'Updated ', ';')
                general.updated = moment(upd).toString();
            }

            const counties = [];
    
            countyRows.each((i, el) => {

                const county = utils.getTemplateObject();

                let name = $(el).children('th').eq(0).text().trim().toUpperCase();
                let stats = $(el).children('td');

                county.setArea(name);

                if (stats.length > 0 && name !== '' && name !== 'TOTAL') {
                    const confirmed = +$(stats).eq(2).text().trim()
                    county.setCases({con:confirmed});
                    counties.push(county.output())
                }
            })

            general.totals = utils.getTotals(counties)
            results.general = general
            results.counties = counties

            callback(null, results);
        })
        .catch(callback);

};