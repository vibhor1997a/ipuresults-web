$(document).ready(function () {
    let parsedPath, urlParams, rankType, fileId, page, institutionCode, rollNumber, name, institutionName, rank, marks;
    function init() {
        parsedPath = parsePath(location.pathname);
        urlParams = new URLSearchParams(location.search);
        if (!parsedPath) {
            location.href = '/404notfound';
            return;
        }
        rankType = parsedPath.rankType;
        fileId = parsedPath.fileId;
        page = urlParams.get('page') || 1;
        institutionCode = urlParams.get('institutionCode') || undefined;
        if (rankType == 'college') {
            rankType = 'institution';
            if (!institutionCode) {
                location.href = '/404notfound';
                return;
            }
        }

        rollNumber = urlParams.get('rollNumber') || undefined;
        name = urlParams.get('name') || undefined;
        institutionName = urlParams.get('institutionName') || undefined;
        rank = urlParams.get('rank') || undefined;
        marks = urlParams.get('marks') || undefined;
    }

    init();
    onpopstate = init;
    getRankListWrapper({ rankType, fileId, institutionCode, rollNumber, name, institutionName, rank, marks, page }, () => {
        // $('#ads-container').html(`<script async="async" data-cfasync="false" src="//pl15240768.passeura.com/48e96d91e2f3430c7cd327c41092ca0e/invoke.js"></script>
        // <div id="container-48e96d91e2f3430c7cd327c41092ca0e"></div>`);
    });

    $('#next-page').on('click', function () {
        page = Number(page) + 1;
        getRankListWrapper({ rankType, fileId, institutionCode, rollNumber, name, institutionName, rank, marks, page }, () => {
            urlParams.set('page', page);
            setHistory(urlParams);
        });
    });

    $('#prev-page').on('click', function () {
        page = Number(page);
        if (page > 1) {
            page--;
            getRankListWrapper({ rankType, fileId, institutionCode, rollNumber, name, institutionName, rank, marks, page }, () => {
                urlParams.set('page', page);
                setHistory(urlParams);
            });
        }
    });
});

function getRankListWrapper(options, cb) {
    const { rankType, fileId, institutionCode, rollNumber, name, institutionName, rank, marks, page } = options;
    let extraRank = rollNumber && name && institutionName && rank && institutionCode && marks;
    getRankList({ rankType, fileId, institutionCode, page }, (err, rankList) => {
        if (err) {
            alert("Something went wrong");
            location.href = '/';
            cb && cb();
        }
        else {
            let tbodyHtml = '';
            for (let rank of rankList) {
                let trClass = '';
                if (rank.rollNumber == rollNumber) {
                    extraRank = false;
                    trClass = ' class="table-primary"';
                }
                tbodyHtml += `
                <tr${trClass}>
                <td>
                ${rankType == 'university' ? rank.universityRank : rank.collegeRank}
                </td>
                <td>
                <a target="_blank" href="/result/${rank.rollNumber}" class="d-flex align-items-center-justify-content-start">
                <span>${rank.rollNumber}</span>
                <span><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-external-link"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></span>
                </a>
                </td>
                <td>
                ${rank.name}
                </td>
                <td>
                ${rank.institution.name}
                </td>
                <td>
                ${rank.marks}
                </td>
                </tr>`;
            }
            if (extraRank) {
                tbodyHtml += `<tr class="table-primary">
            <td>
            ${rank}
            </td>
            <td>
            <a target="_blank" href="/result/${rollNumber}" class="d-flex align-items-center-justify-content-start">
            <span>${rollNumber}</span>
            <span><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-external-link"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></span>
            </a>
            </td>
            <td>
            ${name}
            </td>
            <td>
            ${institutionName}
            </td>
            <td>
            ${marks}
            </td>
            </tr>`;
            }
            $('#ranks-table>tbody').html(tbodyHtml);
            cb && cb();
        }
    });
}

function getRankList(options, cb) {
    const { rankType, fileId, page, institutionCode } = options;
    $.get({
        url: config.apiURL + `/ranks/${rankType}`,
        data: {
            fileId,
            offset: (page - 1) * 10,
            limit: 10,
            institutionCode
        },
        success: response => {
            cb(undefined, response.data)
        },
        error: err => {
            cb(err);
        }
    })
}

function parsePath(pathname) {
    const match = pathname.match(/^\/(.+)-ranks\/(.+)/);
    if (match) {
        return {
            rankType: match[1],
            fileId: match[2]
        };
    }
}

function setHistory(urlParams) {
    let qs = urlParams.toString();
    if (qs) {
        qs = '?' + qs;
    }
    history.pushState(undefined, urlParams.get('page'), location.pathname + qs);
    ga('set', 'page', location.pathname + qs);
    ga('send', 'pageview');
}