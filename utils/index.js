function getTemplateObject() {

    const template = {
        area: undefined,
        cases: {},
        tests: {},
        setArea(name) { this.area = name.toUpperCase() },
        setCases(data) {
            this.cases = data
        },
        setTests(data) {
            this.tests = data
        },
        output() {
            return { area: this.area, cases: this.cases, tests: this.tests }
        }
    }

    return Object.create(template);
}

function getTotals(list) {

    const totals = getTemplateObject()

    let con = rec = dea = pos = neg = pen = sum = 0

    list.forEach(d => {
        con += (d.cases.con > 0) ? d.cases.con : 0;
        rec += (d.cases.rec > 0) ? d.cases.rec : 0;
        dea += (d.cases.dea > 0) ? d.cases.dea : 0;

        pos += (d.tests.pos > 0) ? d.tests.pos : 0;
        neg += (d.tests.neg > 0) ? d.tests.neg : 0;
        pen += (d.tests.pen > 0) ? d.tests.pen : 0;
        sum += (d.tests.sum > 0) ? d.tests.sum : 0;
    });

    totals.cases.con = (con > 0) ? con : undefined;
    totals.cases.rec = (rec > 0) ? rec : undefined;
    totals.cases.dea = (dea > 0) ? dea : undefined;

    totals.tests.pos = (pos > 0) ? pos : undefined;
    totals.tests.neg = (neg > 0) ? neg : undefined;
    totals.tests.pen = (pen > 0) ? pen : undefined;
    totals.tests.sum = (sum > 0) ? sum : undefined;

    return totals.output()
}

function extract(str, pos1, pos2) {

    return str.substring(
        str.indexOf(pos1) + pos1.length,
        str.lastIndexOf(pos2)
    );

}

function buildTableauRequest({uri, referrer, dashboard, viewId, workbookId}) {

    var updated = Date.now()

    var options = { 
        uri: uri, 
        "credentials": "include", 
        "headers": { 
            "accept": "text/javascript", 
            "accept-language": 
            "en-US,en;q=0.9", 
            "content-type": 
            "application/x-www-form-urlencoded", 
            "sec-fetch-dest": "empty", 
            "sec-fetch-mode": "cors", 
            "sec-fetch-site": "same-origin", 
            "x-tsi-active-tab": dashboard 
        }, 
        "referrer": referrer, 
        "referrerPolicy": "no-referrer-when-downgrade", 
        "body": "worksheetPortSize=%7B%22w%22%3A800%2C%22h%22%3A800%7D&dashboardPortSize=%7B%22w%22%3A800%2C%22h%22%3A800%7D&clientDimension=%7B%22w%22%3A904%2C%22h%22%3A739%7D&renderMapsClientSide=true&isBrowserRendering=true&browserRenderingThreshold=100&formatDataValueLocally=false&clientNum=&navType=Reload&navSrc=Top&devicePixelRatio=2&clientRenderPixelLimit=25000000&sheet_id="+dashboard+"&showParams=%7B%22checkpoint%22%3Afalse%2C%22refresh%22%3Afalse%2C%22refreshUnmodified%22%3Afalse%7D&stickySessionKey=%7B%22featureFlags%22%3A%22%7B%7D%22%2C%22isAuthoring%22%3Afalse%2C%22isOfflineMode%22%3Afalse%2C%22lastUpdatedAt%22%3A"+updated+"%2C%22viewId%22%3A"+viewId+"%2C%22workbookId%22%3A"+workbookId+"%7D&filterTileSize=200&locale=en_US&language=en&verboseMode=false&:session_feature_flags=%7B%7D&keychain_version=1", 
        "method": "POST", 
        "mode": "cors" 
    }

    return options
}

module.exports = {
    getTemplateObject,
    getTotals,
    extract,
    buildTableauRequest
};