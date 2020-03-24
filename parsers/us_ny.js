const request = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');
const utils = require('../utils')

let general = {
    state: "New York",
    source: "https://coronavirus.health.ny.gov/county-county-breakdown-positive-cases"
}

module.exports.parse = (event, context, callback) => {

    general.timestamp = moment().toString();

    let results = {}

    request(general.source)
        .then(({ data }) => {

            const $ = cheerio.load(data);
            const countyRows = $('.wysiwyg--field-webny-wysiwyg-body table tr');

            let upd = $('div.wysiwyg--field-webny-wysiwyg-title').text().trim();
            if (upd !== undefined) {
                upd = upd.split(': ')
                upd = upd[1].split(' | ')
                general.updated = moment(`${upd[0]}, ${upd[1]} −05:00`, 'MMMM DD, YYYY, hh:mm Z').toString();
            }

            const counties = [];

            countyRows.each((i, el) => {

                const county = utils.getTemplateObject();

                let items = $(el).children('td')
                if (items !== undefined) {

                    let name = $(items).eq(0).text().trim().toUpperCase()
                    let stat = +$(items).eq(1).text().trim().replace(/,/g,'')

                    if (name !== '' && name !== 'TOTAL NUMBER OF POSITIVE CASES') {
                        county.setArea(name);
                        county.setCases({ con: stat });
                        counties.push(county.output())
                    }
                }
            })

            general.totals = utils.getTotals(counties)
            results.general = general
            results.counties = counties

            callback(null, results);
        })
        .catch(callback);

};