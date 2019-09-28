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
        $searchBtn.text('Searching...').attr('disabled', true);
        getResultWrapper(rollNumber);
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
        getResultWrapper(rollNumber);
    }
    else {
        $('#rollnumber-card').show();
    }
    $('#result-err-msg').hide().text('');
    $('#result-container').hide().html('');
    return rollNumber;
}

function getResultWrapper(rollNumber) {
    getResult(rollNumber, (err, data) => {
        $('#search-btn').text('Search').removeAttr('disabled');
        if (err) {
            $('#result-err-msg').text(err.responseJSON && err.responseJSON.message || 'Something Went Wrong').show();
        }
        else {
            $('#result-err-msg').hide().text('');
            $('#rollnumber-card').hide();
            $('#result-container').html(makeResultHtml(data)).show();
            history.pushState(undefined, rollNumber, `/result/${rollNumber}`)
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