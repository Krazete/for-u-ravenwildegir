var legend, timelist, dynamicStyle;

function initLegend() {
    legend = document.getElementById("legend");
    timelist = document.getElementById("timelist");
    dynamicStyle = document.getElementById("dynamic-style");
    initScanline();
    initDays();
    initTime();
}

function initScanline() {
    var scanline = document.getElementById("scanline");
    function followMouse(e) {
        var legendBox = legend.getBoundingClientRect();
        scanline.style.left = (e.x - legendBox.x) + "px";
    }
    legend.addEventListener("mousemove", followMouse);
}

function initDays() {
    var days = document.getElementById("days");
    for (var day of days.children) {
        day.addEventListener("click", function () {
            for (var that of days.children) {
                that.classList.remove("selected");
            }
            this.classList.add("selected");
            today = this.dataset.day;
            initTimeline();
        });
    }
    days.children[new Date().getDay()].click();
}

function getTime() {
    var date = new Date();
    var time = date.getHours() + date.getMinutes() / 60;
    return time;
}

function initTime() {
    var time = getTime();
    var percent = 100 * time / 24;
    dynamicStyle.innerHTML = `.timetable {
        background: linear-gradient(to right, gray ${percent}%, white ${percent}%);
        background: linear-gradient(to right, var(--color-2) ${percent}%, var(--color-3) ${percent}%);
    }`;
    setTimeout(initTime, 60000);
}

function initTimeline() {
    function sortKeys(obj) {
        var keys = Object.keys(obj);
        keys.sort(byAlpha);
        return keys;
    }
    function byAlpha(a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
    }
    function formatTime(t) {
        var meridiem = "am";
        var hour = Math.floor(t);
        var minute = Math.floor(60 * (t - hour));
        if (hour >= 12) {
            meridiem = "pm";
            if (hour > 12) {
                hour -= 12;
            }
        }
        if (hour <= 0 || hour >= 24) { // will probably never happen
            meridiem = "am";
            hour = "12";
        }
        return hour + ":" + (minute < 10 ? "0" : "") + minute + meridiem;
    }
    function newTimeheader(building) {
        var timeheader = document.createElement("div");
            timeheader.className = "timeheader";
            timeheader.id = building;
        return timeheader;
    }
    function newTimetable(building, day) {
        var timetable = document.createElement("div");
            timetable.className = "timetable";
            timetable.appendChild(newTimeline(building));
            for (var room of sortKeys(database[building])) {
                timetable.appendChild(newTimeline(building, room, day));
            }
        return timetable;
    }
    function newTimeline(building, room, day) {
        var timeline = document.createElement("div");
            timeline.className = "timeline";
            for (var i = 0; i < 24; i++) {
                timeline.appendChild(newTimeunit(i));
            }
            if (typeof room != "undefined") {
                timeline.dataset.room = room;
                for (var hours of database[building][room][day]) {
                    timeline.appendChild(newTimespan(building, room, hours[0], hours[1], day));
                }
            }
        return timeline;
    }
    function newTimeunit(i) {
        var timeunit = document.createElement("div");
            timeunit.className = "timeunit";
        return timeunit;
    }
    function newTimespan(building, room, a, b, day) {
        var timespan = document.createElement("div");
            timespan.className = "timespan";
            timespan.style.left = (100 * a / 24) + "%";
            timespan.style.width = (100 * (b - a) / 24) + "%";
        return timespan;
    }
    timelist.innerHTML = "";
    for (var building of sortKeys(database)) {
        timelist.appendChild(newTimeheader(building));
        timelist.appendChild(newTimetable(building, today));
    }
    var time = getTime();
    timelist.scrollTo((time - 1) * 1500/24, 0);
}
