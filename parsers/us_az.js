const rp = require('request-promise')
const moment = require('moment');
const parse = require('csv-parse/lib/sync')
const utils = require('../utils')

let general = {
    state: "Arizona",
    source: "https://www.azdhs.gov/preparedness/epidemiology-disease-control/infectious-disease-epidemiology/index.php#novel-coronavirus-home",
    notes: "Test information is inconsistent with case information, as details are not available for privately tested cases."
}

const urls = {
    session: 'https://tableau.azdhs.gov/views/UpdatedCOVIDdashboard/Dashboard1?%3Aembed=y&%3AshowVizHome=no&%3Ahost_url=https%3A%2F%2Ftableau.azdhs.gov%2F&%3Aembed_code_version=3&%3Atabs=no&%3Atoolbar=no&%3AshowAppBanner=false&%3Adisplay_spinner=no&iframeSizedToWindow=true&%3AloadOrderID=0',
    bootstrap: 'https://tableau.azdhs.gov/vizql/w/UpdatedCOVIDdashboard/v/Dashboard1/bootstrapSession/sessions/[[session_id]]',
    main : 'https://tableau.azdhs.gov/vizql/w/UpdatedCOVIDdashboard/v/Dashboard1/vud/sessions/[[session_id]]/views/10455850409443852714_16808945633352663536?csv=true&summary=true',
    date : 'https://tableau.azdhs.gov/vizql/w/UpdatedCOVIDdashboard/v/Dashboard1/vud/sessions/[[session_id]]/views/10455850409443852714_3280869776074519419?csv=true&summary=true',
    tests: 'https://tableau.azdhs.gov/vizql/w/UpdatedCOVIDdashboard/v/Dashboard1/vud/sessions/[[session_id]]/views/10455850409443852714_2738315765867498942?csv=true&summary=true'
}

module.exports.parse = (event, context, callback) => {
    try {
        processRequests().then(results => {
            callback(null, results)
        }).catch(callback)
    }
    catch (err) {
        callback(err)
    }
};

async function processRequests() {

    general.timestamp = moment().toString();
    
    let results = {}
    let counties = [];

    // Step 1. Initial request to retrieve a session
    const rp_session = await rp({uri:urls.session,resolveWithFullResponse: true});
    const session_id = rp_session.headers['x-session-id'].trim();

    // Step 2. Secondary request to bootstrap the session
    const rp_boot_opti = utils.buildTableauRequest({
        uri: urls.bootstrap.replace('[[session_id]]',session_id),
        referrer: urls.session,
        dashboard: "Dashboard%201",
        viewId: 237,
        workbookId: 28
    })
    const rp_bootstrap = await rp(rp_boot_opti)

    // Step 3. At this point the sesssion ID should be useable
    //         Main request for the testing data view
    let rp_data = await rp(urls.main.replace('[[session_id]]',session_id));

    const data_records = parse(rp_data, { skip_empty_lines: true })
    data_records.forEach(row => {

        const area = row[0].toString()
        const con = +row[3]

        if (isNaN(con))
            return;

        const county = utils.getTemplateObject();

        county.setArea(area);
        county.setCases({ con });
        counties.push(county.output());

    });

    general.totals = utils.getTotals(counties)
    results.general = general
    results.counties = counties

    // Step 4. Get the cumulative test results. AZ doesn't break
    //         them out by county.
    const rp_tests = await rp(urls.tests.replace('[[session_id]]',session_id));

    const test_records = parse(rp_tests, { skip_empty_lines: true })
    let pos = neg = pen = sum = 0

    sum = +test_records[1][1]
    neg = +test_records[2][1]
    pen = +test_records[3][1]
    pos = +test_records[4][1]

    results.general.totals.tests = {pos, neg, pen, sum}

    // Step 5. Get the date the numbers were updated
    const rp_date = await rp(urls.date.replace('[[session_id]]',session_id));

    let updated = rp_date.split('\n')
    results.general.updated = moment(updated[1],'M/D/YYY').toString()

    // All set. Return results.
    return results
}