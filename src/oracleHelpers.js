const workingHoursPerDay='7';
//Set your number of working hours per day (for part time working, probably best just set at your maximum length of day)

/////////////////////////////////////////////////////////////////////////////////////////
// Decimal Hours to Days, Hours & minutes
/////////////////////////////////////////////////////////////////////////////////////////

//Define the day, hours and minutes tooltip appearance
const tooltip = document.createElement('div');
tooltip.style.fontFamily = 'sans-serif';
tooltip.style.position = 'absolute';
tooltip.style.backgroundColor = '#333';
tooltip.style.color = '#fff';
tooltip.style.padding = '5px';
tooltip.style.borderRadius = '5px';
tooltip.style.display = 'none';
tooltip.style.zIndex = '100000000000000';
tooltip.style.border = '1px solid white';
document.body.appendChild(tooltip);

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
        tooltip.innerHTML = `<small>${decimalHours}h is:</small><br/><strong>${daysHoursMinutesText}</strong><br/><small>(${workingHoursPerDay}h working day)</small>`;
        tooltip.style.left = `${e.pageX + 10}px`;
        tooltip.style.top = `${e.pageY + 10}px`;
        tooltip.style.display = 'block';
    } else {
        tooltip.style.display = 'none';
    }
}

// Function to hide the tooltip
function hideTooltip() {
    tooltip.style.display = 'none';
}

/////////////////////////////////////////////////////////////////////////////////////////
// Time Card - Show Accurate Reported Hours
/////////////////////////////////////////////////////////////////////////////////////////

//Get the total number of hours
function getTotalNumberOfHours(){
    var totalHours = 0;
    document.querySelectorAll('.Apps4XLargeFontSize').forEach(function(time) {
        totalHours += parseFloat(time.textContent);
    });
    totalHours = parseFloat(parseFloat(totalHours).toFixed(2));
    return totalHours;
}

function timeCard_showAccurateReportedHours(){
    //Check if we can find the total value on the page
    var scoreboardDiv = document.querySelector("table[id$='dc_i1:1:dc_pgl11'] .scoreboard-value");
    if (scoreboardDiv == null) return;

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
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
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
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours % 1) * 60);
    return `${hours}h ${minutes}m`;
}

function webClock_showTotalElaspedTime(){
    // Get clocking table in HTML
    const clockingTable = document.querySelector("[id$='PSErlt']");
    if(clockingTable == null) return;
    
    // Get all the times from the table
    const clockInOutTimes = clockingTable.querySelectorAll('span');
    if(clockInOutTimes == null) return;

    //Get the time display object
    const timeDisplay = document.querySelector("[id$='digitalDuration']");
    if(timeDisplay == null) return;
    
    //Add the clocking times to an array
    const clockingTimes = [];
    clockInOutTimes.forEach(clockInOutTime => {
        clockingTimes.push(timeStringToDate(clockInOutTime.textContent));
    })
    
    const clockedInHours = calculateClockedInHours(clockingTimes);
    const niceTime = convertDecimalHoursToHoursMinutes(clockedInHours.toFixed(2));
    timeDisplay.innerHTML += ` (Total clocked-in hours: ${niceTime})`;
}

/////////////////////////////////////////////////////////////////////////////////////////
// Start Processes
/////////////////////////////////////////////////////////////////////////////////////////

timeCard_showAccurateReportedHours();
webClock_showTotalElaspedTime();

// Add event listeners for tooltips
document.addEventListener('mouseup', showTooltip);
document.addEventListener('mousedown', hideTooltip);
