$(document).ready(function () {
    let rollNumber = init();

    let $searchBtn = $('#search-btn');
    let $rollNumberInput = $('#rollnumber');
    $searchBtn.on('click', function () {
        rollNumber = $rollNumberInput.val().trim();
        const isValid = /^\d{11,11}$/.test(rollNumber);
        if (!isValid) {
            $('#result-err-msg').text('Please enter a valid rollnumber').show();
            return;
        }
        getResultWrapper(rollNumber, true);
    });
    $rollNumberInput.on('keyup', function (evt) {
        $('#result-err-msg').hide().text('');
        if (evt.which == 13) {
            $searchBtn.click();
        }
    });
    onpopstate = init;
});

function init() {
    let rollNumber = parseURL(location.href);
    if (rollNumber) {
        $('#rollnumber').val(rollNumber).trigger('change');
        getResultWrapper(rollNumber);
    }
    else {
        $('#rollnumber-card').show();
    }
    $('#result-err-msg').hide().text('');
    $('#result-container').hide().html('');
    return rollNumber;
}

function getResultWrapper(rollNumber, changeState) {
    let $searchBtn = $('#search-btn');
    $searchBtn.text('Searching...').attr('disabled', true);
    getResult(rollNumber, (err, data) => {
        $searchBtn.text('Search').removeAttr('disabled');
        if (err) {
            $('#result-err-msg').text(err.responseJSON && err.responseJSON.message || 'Something Went Wrong').show();
        }
        else {
            $('#result-err-msg').hide().text('');
            $('#rollnumber-card').hide();
            $('#result-container').html(makeResultHtml(data)).show();
            if (changeState) {
                history.pushState(undefined, rollNumber, `/result/${rollNumber}`);
                ga('set', 'page', `/result/${rollNumber}`);
                ga('send', 'pageview');
            }
            $('title').text(`${data.name}'s Result`);
            // $('#ads-container').html(`<script async="async" data-cfasync="false" src="//pl15240768.passeura.com/48e96d91e2f3430c7cd327c41092ca0e/invoke.js"></script>
            // <div id="container-48e96d91e2f3430c7cd327c41092ca0e"></div>`);
        }
    });
}

function getResult(rollNumber, cb) {
    $.ajax({
        url: config.apiURL + `/results/${rollNumber}`,
        success: response => {
            cb(undefined, response.data);
        },
        error: err => {
            cb(err);
        }
    });
}

function makeResultHtml(result) {
    let html = `<div class="row">
    <div class="card">
        <div class="card-body" id="result-summary">
            <table class="table table-striped border table-responsive-sm">
                <tr>
                    <th>ROLL NUMBER</th>
                    <td>${result.rollNumber}</td>
                </tr>
                <tr>
                    <th>NAME</th>
                    <td>${result.name}</td>
                </tr>
                <tr>
                    <th>PROGRAMME</th>
                    <td>${result.programme.name}</td>
                </tr>
                <tr>
                    <th>INSTITUTION</th>
                    <td>${result.institution.name}</td>
                </tr>
                <tr>
                    <th>BATCH</th>
                    <td>${result.batch}</td>
                </tr>
                <tr>
                    <th>AGGREGATE PERCENTAGE</th>
                    <td>${result.aggregatePercentage}</td>
                </tr>
                <tr>
                    <th>AGGREGATE CREDIT PERCENTAGE</th>
                    <td>${result.aggregateCreditPercentage}</td>
                </tr>
                <tr>
                    <th>CREDITS</th>
                    <td>${result.totalCreditsEarned}/${result.maxCredits}</td>
                </tr>
            </table>
        </div>
    </div>
</div>`;

    let nonRegularResults = {};

    for (let j in result.results) {
        let semesterResult = result.results[j];
        if (semesterResult.exam.regularReappear == "regular") {
            let subjectsHtml = '';
            let subjects = semesterResult.subjects;
            if (nonRegularResults[semesterResult.semYear.num]) {
                for (let nonRegularResult of nonRegularResults[semesterResult.semYear.num]) {
                    let nonRegularSubjects = nonRegularResult.subjects.map(subject => {
                        subject.declared = new Date(nonRegularResult.declared);
                        return subject;
                    });
                    subjects = subjects.concat(nonRegularSubjects);
                }
            }
            subjects.sort((subjectA, subjectB) => {
                if (subjectA.declared && subjectB.declared) {
                    return subjectA.declared.getTime() - subjectB.declared.getTime()
                }
                else if (subjectA.declared) {
                    return 1;
                }
                else if (subjectB.declared) {
                    return -1;
                }
                else {
                    return 0;
                }
            });

            for (let i in subjects) {
                const subject = subjects[i];
                subjectsHtml += `<tr class="${!subject.isPassed ? 'table-danger' : ''}">
                <th>${Number(i) + 1}</th>
                <td>${subject.name.trim()}</td>
                <td>${subject.minor.earned}</td>
                <td>${subject.major.earned}</td>
                <td>${subject.total.earned}</td>
            </tr>`;
            }

            html += `<div class="row">
    <button class="btn btn-block btn-primary d-flex align-items-center justify-content-between" data-toggle="collapse" data-target="#semester-result-${semesterResult.semYear.num}">
            <div>
            ${semesterResult.semYear.type == 'sem' ? 'SEMESTER' : 'ANNUAL'} ${semesterResult.semYear.num}
            </div>
            <div>
            +
            </div>
    </button>
    <div class="card collapse ${j == 0 ? 'show' : ''}" id="semester-result-${semesterResult.semYear.num}">
        <div class="card-body">
            <table class="table table-striped border table-responsive-sm">
                <thead>
                    <tr>
                    <th>#</th>
                    <th>Subject</th>
                    <th>Internal</th>
                    <th>External</th>
                    <th>Total</th>
                    </tr>
                </thead>
                ${subjectsHtml}
            </table>
            <table class="table table-striped border table-responsive-sm">
            <tbody>
                <tr>
                    <th>
                    Percentage
                    </th>
                    <td>
                    ${semesterResult.percentage}
                    </td>
                    <th>
                    Total Marks
                    </th>
                    <td>
                    ${semesterResult.totalMarks}/${semesterResult.maxMarks}
                    </td>
                </tr>
                <tr>
                    <th>
                    College Rank
                    </th>
                    <td>
                    ${getCollegeRank(result, semesterResult)}
                    </td>
                    <th>
                    University Rank
                    </th>
                    <td>
                    ${getUniversityRank(result, semesterResult)}
                    </td>
                </tr>
                <tr>
                    <th>
                    Credit Percentage
                    </th>
                    <td>
                    ${semesterResult.creditPercentage}
                    </td>
                </tr>
            </tbody>
        </table>
        </div>
    </div>
</div>`;
        }
        else {
            if (!nonRegularResults[semesterResult.semYear.num]) {
                nonRegularResults[semesterResult.semYear.num] = []
            }
            nonRegularResults[semesterResult.semYear.num].push(semesterResult);
        }
    }
    return html;
}

function parseURL(url) {
    let match = url.match(/(?:.+)\/(\d{11,11})/);
    if (!match) {
        return;
    }
    else {
        return match[1];
    }
}

function getCollegeRank(result, semesterResult) {
    if (!semesterResult.collegeRank) {
        return 'Not available';
    }
    else {
        return `<a class="d-flex align-items-center justify-content-start" target="_blank" href="/college-ranks/${semesterResult.fileId}?institutionCode=${result.institution.code}&page=1&name=${result.name}&rollNumber=${result.rollNumber}&institutionName=${result.institution.name}&marks=${semesterResult.totalMarks}&rank=${semesterResult.collegeRank}">
        <span>${semesterResult.collegeRank}</span>
        <span>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-external-link"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </span>
        </a>`;
    }
}

function getUniversityRank(result, semesterResult) {
    if (!semesterResult.universityRank) {
        return 'Not available';
    }
    else {
        return `<a class="d-flex align-items-center justify-content-start" target="_blank" href="/university-ranks/${semesterResult.fileId}?institutionCode=${result.institution.code}&page=1&name=${result.name}&rollNumber=${result.rollNumber}&institutionName=${result.institution.name}&marks=${semesterResult.totalMarks}&rank=${semesterResult.universityRank}">
        <span>${semesterResult.universityRank}</span>
        <span>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-external-link"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </span>
        </a>`;
    }
}