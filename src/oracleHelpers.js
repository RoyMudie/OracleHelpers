console.log("Loading OracleHelpers v1...")

//Set your number of working hours per day (for part time working, probably best just set at your maximum length of day)
const workingHoursPerDay='7';

/////////////////////////////////////////////////////////////////////////////////////////
// Decimal Hours to Days, Hours & minutes
/////////////////////////////////////////////////////////////////////////////////////////

//Define the day, hours and minutes tooltip appearance
const tooltipDefaults = document.createElement('div');
tooltipDefaults.id = "tooltip";
tooltipDefaults.style.fontFamily = 'sans-serif';
tooltipDefaults.style.fontSize = "1.5em";
tooltipDefaults.style.position = 'absolute';
tooltipDefaults.style.backgroundColor = '#333';
tooltipDefaults.style.color = '#fff';
tooltipDefaults.style.padding = '5px';
tooltipDefaults.style.borderRadius = '5px';
tooltipDefaults.style.display = 'none';
tooltipDefaults.style.zIndex = '100000000000000';
tooltipDefaults.style.border = '1px solid white';

// Append tooltip to the body if not already appended
if (!document.body.contains(document.getElementById('tooltip'))) {
    document.body.appendChild(tooltipDefaults);
}

//Gets the highlighted text on the page
function getHighlightedTextAsNumber() {
    let selectedText = "";
    if (window.getSelection) {
        selectedText = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        selectedText = document.selection.createRange().text;
    }
    //Clean out all other characters to get the number for the sake of making a simplier user experiance
    const cleanedString = selectedText.replace(/[^0-9.]/g, '');
    //Get rid of trailing .00 on a round number of hours
    return parseFloat(parseFloat(cleanedString).toFixed(2));
}

//Converts decimal hours (e.g. 8.75h) into days, hours and minutes (e.g. assuming a 7 hour working day that becomes: "1 days 1h 45m")
function convertDecimalHoursToDaysHoursMinutes(decimalHours) {
    var totalMinutes = decimalHours * 60;
    var workDayMinutes = workingHoursPerDay * 60;
    
    var days = Math.floor(totalMinutes / workDayMinutes);
    var remainingMinutes = totalMinutes % workDayMinutes;
    
    var hours = Math.floor(remainingMinutes / 60);
    var minutes = Math.round(remainingMinutes % 60);
    return `${days} days ${hours}h ${minutes}m`;
}

// Function to show the tooltip if a valid number has been selected
function showTooltip(e) {
    const decimalHours = getHighlightedTextAsNumber();
    const response = "";
    if (!isNaN(decimalHours)) {
        const daysHoursMinutesText = convertDecimalHoursToDaysHoursMinutes(decimalHours);
        var tooltip = document.getElementById('tooltip');
        tooltip.innerHTML = `<small>${decimalHours}h is:</small><br/><strong>${daysHoursMinutesText}</strong><br/><small>(${workingHoursPerDay}h working day)</small>`;
        tooltip.style.left = `${e.pageX + 10}px`;
        tooltip.style.top = `${e.pageY + 10}px`;
        tooltip.style.display = 'block';
    } else {
        var tooltip = document.getElementById('tooltip');
        tooltip.style.display = 'none';
    }
}

// Function to hide the tooltip
function hideTooltip() {
    var tooltip = document.getElementById('tooltip');
    tooltip.style.display = 'none';
}

function toolTip_addListeners() {
    // Ensure event listeners are added only once
    if (!window.tooltipListenersAdded) {
        document.addEventListener('mousedown', hideTooltip);
        document.addEventListener('mouseup', showTooltip);
        window.tooltipListenersAdded = true;
    }
}

/////////////////////////////////////////////////////////////////////////////////////////
// Time Card - Show Accurate Reported Hours
/////////////////////////////////////////////////////////////////////////////////////////

//Get all the time values on the timecard
function getAllTimesOnTimeCard(){
    return document.querySelectorAll('.Apps4XLargeFontSize')
}

//Get the total number of hours
function getTotalNumberOfHours(){
    var totalHours = 0;
    getAllTimesOnTimeCard().forEach(function(timeObj) {
         //Add to total hours count
        totalHours += parseFloat(timeObj.innerHTML);
        
        //Update display to convert to hours and minutes
        //This is done globally now by looking for all spans that contain numbers with decimal values
        /*var hoursAndMinutes = convertDecimalHoursToHoursMinutes(timeObj.innerHTML);
        timeObj.innerHTML = `(${hoursAndMinutes}) ` + timeObj.innerHTML*/
    });
    totalHours = parseFloat(parseFloat(totalHours).toFixed(2));
    return totalHours;
}

function timeCard_showAccurateReportedHours(){
    //Check if we can find the total value on the page
    var scoreboardDiv = document.querySelector("table[id$='dc_i1:1:dc_pgl11'] .scoreboard-value");
    if (scoreboardDiv == null) return;

    //Check if we've already added the value so don't add again
    if(scoreboardDiv.textContent.includes("(")) return;

    totalHoursDecimal = getTotalNumberOfHours();
    totalHoursDaysHouseMinutes = convertDecimalHoursToDaysHoursMinutes(totalHoursDecimal);
    
    scoreboardDiv.textContent += ` (${totalHoursDecimal}h or ${totalHoursDaysHouseMinutes})`; 
}

/////////////////////////////////////////////////////////////////////////////////////////
// Web Clock - Show Total Elasped Time
/////////////////////////////////////////////////////////////////////////////////////////

// Helper function to convert time string to Date object
function timeStringToDate(timeString) {
    const now = new Date();
    let [time, period] = timeString.split(' ');
    let [hours, minutes, seconds] = time.split(':').map(Number);

    //Deal with the possibilty of time being presented like: "01:15 PM"
    if (period === 'PM' && hours < 12) {
        hours += 12;
    }
    if (period === 'AM' && hours === 12) {
        hours = 0;
    }
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds);
}

//Calculate the amount of clocked in time from an array of times
function calculateClockedInHours(times) {
    let totalMilliseconds = 0;
    let clockInTime = null;

    //For all the times in the array
    for (let i = 0; i < times.length; i++) {
        const currentTime = times[i];

        //If its an odd row then assume clock in
        if (i % 2 === 0) {
            // Clock-in time
            clockInTime = currentTime;
        } else {
            // Clock-out time
            totalMilliseconds += currentTime - clockInTime;
            clockInTime = null;
        }
    }

    // If there is an unmatched clock-in time, calculate time until now
    if (clockInTime !== null) {
        totalMilliseconds += new Date() - clockInTime;
    }

    // Convert milliseconds to hours
    const totalHours = totalMilliseconds / (1000 * 60 * 60);
    return totalHours;
}

//Function to convert deciaml hours into readable hours and minutes
function convertDecimalHoursToHoursMinutes(decimalHours) {
    /*const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours % 1) * 60);
    return `${hours}h ${minutes}m`;*/

    const sign = decimalHours < 0 ? -1 : 1; 
    const absoluteHours = Math.floor(Math.abs(decimalHours));
    const absoluteMinutes = Math.round((Math.abs(decimalHours) % 1) * 60);
    
    const hours = absoluteHours * sign;
    const minutes = absoluteMinutes * sign;

    return `${hours}h ${Math.abs(minutes)}m`
}

function webClock_showTotalElaspedTime(){
    const startString = " (Total clocked-in hours:";
    
    //Get the time display object
    const timeDisplay = document.querySelector("[id$='digitalDuration']");
    if(timeDisplay == null) return;

    //Exit if we've already added it
    if(timeDisplay.innerHTML.includes(startString)) return;
    
    // Get clocking table in HTML
    const clockingTable = document.querySelector("[id$='PSErlt']");
    if(clockingTable == null) return;
    
    // Get all the times from the table
    const clockInOutTimes = clockingTable.querySelectorAll('span');
    if(clockInOutTimes == null) return;
   
    //Add the clocking times to an array
    const clockingTimes = [];
    clockInOutTimes.forEach(clockInOutTime => {
        clockingTimes.push(timeStringToDate(clockInOutTime.textContent));
    })
    
    const clockedInHours = calculateClockedInHours(clockingTimes);
    const niceTime = convertDecimalHoursToHoursMinutes(clockedInHours.toFixed(2));
    timeDisplay.innerHTML += `${startString} ${niceTime})`;
}

/////////////////////////////////////////////////////////////////////////////////////////
// Globally change all decimal numbers to hours and minutes
/////////////////////////////////////////////////////////////////////////////////////////
function globalNumberChange(){
    const decimalRegex = /^-?\d+\.\d+$/;
    
    document.querySelectorAll('span, div').forEach(span => {
        if (decimalRegex.test(span.innerHTML)) {
            var hoursAndMinutes = convertDecimalHoursToHoursMinutes(span.innerHTML);
            span.innerHTML = `&nbsp;(${hoursAndMinutes})&nbsp;` + span.innerHTML;
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////
// Start Processes
/////////////////////////////////////////////////////////////////////////////////////////

toolTip_addListeners();
timeCard_showAccurateReportedHours();
webClock_showTotalElaspedTime();
globalNumberChange();
