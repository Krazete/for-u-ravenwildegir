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
    var form = document.getElementById("form");
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        loadURL(
            form.method,
            form.action,
            form.encoding,
            "term=" + form.term.value
        ).then(function (response) {
            var database = response;
            console.log(database);
        });
    });
}

window.addEventListener("DOMContentLoaded", init);
