var today, database = {};

function loadURL(method, url, encoding, parameters) {
    function request(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', encoding);
        xhr.onload = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                resolve(JSON.parse(this.response));
            }
        };
        xhr.onerror = function() {
            reject(new Error("Could not load \"" + url + "\"."));
        };
        xhr.send(parameters);
    }
    return new Promise(request);
}

function init() {
    var legend = document.getElementById("legend");
    initLegend();

    var form = document.getElementById("form");
    form.term.value = localStorage.getItem("term") || "Winter";
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        legend.classList.add("disabled");
        loadURL(
            form.method,
            form.action,
            form.encoding,
            "term=" + form.term.value
        ).then(function (response) {
            database = response;
            initTimeline();
        }).then(function () {
            legend.classList.remove("disabled");
            localStorage.setItem("term", form.term.value);
        });
    });
}

window.addEventListener("DOMContentLoaded", init);
