console.log("Loading OracleHelpers v3...")

//Set your number of working hours per day (for part time working, probably best just set at your maximum length of day)
const workingHoursPerDay='7';

/////////////////////////////////////////////////////////////////////////////////////////
// Decimal Hours to Days, Hours & minutes
/////////////////////////////////////////////////////////////////////////////////////////

// Append tooltip to the body if not already appended
if (!document.body.contains(document.getElementById('calculator-tooltip'))) {

    //Define the day, hours and minutes tooltip appearance
    const tooltipDefaults = document.createElement('div');
    tooltipDefaults.id = "calculator-tooltip";
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
    var calculatorTooltip = document.getElementById('calculator-tooltip');
    if (!isNaN(decimalHours)) {
        const daysHoursMinutesText = convertDecimalHoursToDaysHoursMinutes(decimalHours);
        calculatorTooltip.innerHTML = `<small>${decimalHours}h is:</small><br/><strong>${daysHoursMinutesText}</strong><br/><small>(${workingHoursPerDay}h working day)</small>`;
        calculatorTooltip.style.left = `${e.pageX + 10}px`;
        calculatorTooltip.style.top = `${e.pageY + 10}px`;
        calculatorTooltip.style.display = 'block';
    } else {
        calculatorTooltip.style.display = 'none';
    }
}

// Function to hide the tooltip
function hideTooltip() {
    var calculatorTooltip = document.getElementById('calculator-tooltip');
    calculatorTooltip.style.display = 'none';
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
// Time Card
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
    });
    totalHours = parseFloat(parseFloat(totalHours).toFixed(2));
    return totalHours;
}

//Show the accurate total number of reported hours rather than rounded to a whole number
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

//Show the total number of hours worked on a day on the timecard page
function timeCard_dailyHoursTotal(){

    //Get all the date rows
    const dateRows = document.querySelectorAll('.xjb td');
    //If there's no date rows exit so we don't processes unnessecarly
    if (dateRows == null || dateRows.length == 0) return;
    
    const totalHoursByDate = {};

    //Get all the hours and add them up for each date
    dateRows.forEach(container => {
        // Find the date and hours elements
        const dateElement = container.querySelector('.xng td');
        const hoursElement = container.querySelector('.Apps4XLargeFontSize');

        if (dateElement && hoursElement) {
            console.log(dateElement.textContent.trim());
            console.log(hoursElement.textContent.trim());
            
            const date = dateElement.textContent.trim();
            const hours = parseFloat(hoursElement.textContent.trim());
    
            // Add the hours to the total for this date
            if (totalHoursByDate[date]) {
                totalHoursByDate[date] += hours;
            } else {
                totalHoursByDate[date] = hours;
            }
        }
    });

    //Store which dates we've updated so we don't add it to every date, just the first one
    const updatedDates = new Set();

    // Update the date elements with the total hours
    dateRows.forEach(container => {
        const dateElement = container.querySelector('.xng td');
        if (dateElement) {
            const date = dateElement.textContent.trim();
            if (totalHoursByDate[date] && !updatedDates.has(date)) {
                var totalDayDecimalHours = totalHoursByDate[date].toFixed(2)
                var totalDayHoursAndMinutes = convertDecimalHoursToHoursMinutes(totalDayDecimalHours);
                dateElement.textContent = `${date} (Total: ${totalDayDecimalHours} hours or ${totalDayHoursAndMinutes})`;
                updatedDates.add(date);
            }
        }
    });
}
/////////////////////////////////////////////////////////////////////////////////////////
// Web Clock
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

// Show Total Elasped Time on Webclock page
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
// Existing Absences
/////////////////////////////////////////////////////////////////////////////////////////

//Function to add the calendar elements to the DOM
function addCalendarDom(){
    // Only add calendar objects to DOM if not already added
    if (!document.body.contains(document.getElementById('calendar-style'))) {
    
        //Create the calendar styling
        const calendarStyle = document.createElement('style');
        calendarStyle.id = "calendar-style";
        calendarStyle.textContent = `
            #calendar-container table {
                border-collapse: collapse;
                margin: 20px;
                background-color: #fff;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            #calendar-container th, #calendar-container td {
                padding: 5px;
                text-align: center;
                border: 1px solid #ddd;
            }
            #calendar-container th {
                background-color: #333;
                color: #fff;
            }
            #calendar-container caption {
                font-size: 1.5em;
                font-weight: bold;
                margin-bottom: 10px;
            }
            #calendar-container .weekend { background-color: #f0f0f0; /*light grey */ }
            #calendar-container .other-leave { background-color: #A0A0A0; /*dark grey */ }
            #calendar-container .annual-leave { background-color: #c8e6c9; /* light green */ }
            #calendar-container .flexi-leave { background-color: #ffecb3; /* light yellow */ }
            #calendar-container .public-holidays { background-color: #b3e5fc; /* light blue */ }
            #calendar-container .sickness-leave { background-color: #ffcdd2; /* light red */ }
            #calendar-container .today { font-weight: bold; font-size: 1.6em; padding: 0px; }
            #calendar-popup {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: #fff;
                border: 1px solid #ddd;
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
                display: none;
                z-index: 1000;
                padding: 20px;
                max-width: 90vw;
                max-height: 90vh;
                overflow: auto;
            }
            #calendar-nav button{
                margin: 0 10px 0 0;
            }
            #calendar-popup-close {
                position: absolute;
                top: 10px;
                right: 10px;
                cursor: pointer;
                font-size: 2em;
                font-weight: bold;
            }
            #showCalendar {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
            }
            #calendar-tooltip {
                position: absolute;
                background-color: #333;
                color: #fff;
                padding: 5px;
                border-radius: 5px;
                display: none;
                z-index: 1001;
                pointer-events: none;
                font-size: 1.5em;
                text-transform: capitalize;
                border: 1px solid #fff;
            }
            #calendar-legend {
                margin-top: 20px;
                display: flex;
                border: 0px;
            }
            .calendar-legend-item {
                margin-right: 20px;
                display: flex;
                align-items: center;
            }
            .calendar-legend-color {
                width: 20px;
                height: 20px;
                margin-right: 5px;
            }
        `;
        document.body.appendChild(calendarStyle);
    
        //Create the calendar popup
        const calendarPopup = document.createElement('div');
        calendarPopup.id = 'calendar-popup';
        const calendarPopupClose = document.createElement('div');
        calendarPopupClose.id = 'calendar-popup-close';
        calendarPopupClose.textContent = '×';
        calendarPopup.appendChild(calendarPopupClose);
        const calendarContainer = document.createElement('div');
        calendarContainer.id = 'calendar-container';
        calendarPopup.appendChild(calendarContainer);
        document.body.appendChild(calendarPopup);
    
        //Create the calendar tooltip
        const calendarTooltip = document.createElement('div');
        calendarTooltip.id= 'calendar-tooltip';
        document.body.appendChild(calendarTooltip);
    
        //Add event listener for close
        calendarPopupClose.addEventListener('click', () => {
            calendarPopup.style.display = 'none';
        });
    }
}

function createCompactCalendar(year, leaveDates) {

    //Clear the calendar object
    var calendarContainer = document.getElementById('calendar-container');
    calendarContainer.innerHTML = '';

    // Add navigation buttons
    const calendarNav = document.createElement('div');
    calendarNav.id = 'calendar-nav';
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous Year';
    prevButton.onclick = () => createCompactCalendar(year - 1, leaveDates);
    calendarNav.appendChild(prevButton);
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next Year';
    nextButton.onclick = () => createCompactCalendar(year + 1, leaveDates);
    calendarNav.appendChild(nextButton);
    calendarContainer.appendChild(calendarNav);

    //Add the intro/header
    const header = document.createElement('h2');
    header.innerHTML = `Existing Absences Yearly Calendar (${year})`;
    calendarContainer.append(header);
    const intro = document.createElement('p');
    intro.innerHTML = "This calendar will only display the absences loaded in the table. Please ensure 'all' is selected from the date range and that all absences have been loaded by clicking 'Load More Items' as many times are required.";
    calendarContainer.append(intro);
    
    var longestMonth = 0;
    const table = document.createElement('table');
    const today = new Date(); // Get today's date to highlight todays date
    
    //For each month...
    for (let month = 0; month < 12; month++) {

        //Create the day cells
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        const row = document.createElement('tr');
        const monthCell = document.createElement('td');
        monthCell.textContent = new Date(year, month).toLocaleString('default', { month: 'long' });
        row.appendChild(monthCell);
        //Appdend empty cells at the start to make them the same length and line up the day columns
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('td');
            row.appendChild(emptyCell);
        }
        //For each date
        for (let date = 1; date <= lastDate; date++) {
            const dayCell = document.createElement('td');
            dayCell.textContent = date;
            const dateString = `${year}/${month+1}/${date}`;
            //If there's any absence then add a tooltip
            if (leaveDates[dateString]) {
                leaveDates[dateString].forEach(leave => {
                    dayCell.classList.add(leave.class);
                });
                dayCell.dataset.tooltip = leaveDates[dateString].map(leave => `${leave.type}: ${leave.start} - ${leave.end}`).join('<br />');
                
                var calendarTooltip = document.getElementById('calendar-tooltip');
                dayCell.addEventListener('mouseenter', function(e) {
                    calendarTooltip.innerHTML = this.dataset.tooltip;
                    calendarTooltip.style.left = `${e.pageX + 10}px`;
                    calendarTooltip.style.top = `${e.pageY + 10}px`;
                    calendarTooltip.style.display = 'block';
                });
                dayCell.addEventListener('mouseleave', function() {
                    calendarTooltip.style.display = 'none';
                });
            }
            // Check if the current cell represents today's date
            if (year === today.getFullYear() && month === today.getMonth() && date === today.getDate()) {
                dayCell.classList.add('today'); // Add the 'today' class
            }
            //Style for Saturdays and Sundays
            if ((firstDay + date - 1) % 7 === 0 || (firstDay + date - 1) % 7 === 6) {
                dayCell.classList.add('weekend');  
            }
            row.appendChild(dayCell);
        }
        while (row.children.length < 8) {
            const emptyCell = document.createElement('td');
            row.appendChild(emptyCell);
        }
        
        //Get the longest month to know how many day columns to add
        if(row.children.length > longestMonth) {
            longestMonth = row.children.length - 1;
        }
        table.appendChild(row);
    }
    
    // Add headers for each day
    const headerRow = document.createElement('tr');
    const monthHeader = document.createElement('th');
    monthHeader.textContent = 'Month';
    headerRow.appendChild(monthHeader);
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < longestMonth; i++) {
        const dayCell = document.createElement('th');
        dayCell.textContent = daysOfWeek[i % 7];
        headerRow.appendChild(dayCell);
    }
    table.insertBefore(headerRow, table.firstChild);
    calendarContainer.appendChild(table);

    // Create the legend
    const legend = document.createElement('div');
    legend.id = 'calendar-legend';

    const legendItems = [
        { class: 'weekend', label: 'Weekend' },
        { class: 'annual-leave', label: 'Annual Leave' },
        { class: 'flexi-leave', label: 'Flexi Leave' },
        { class: 'public-holidays', label: 'Public Holidays' },
        { class: 'sickness-leave', label: 'Sickness Leave' },
        { class: 'other-leave', label: 'Other (hover date to see full details)' }
    ];

    legendItems.forEach(item => {
        const legendItem = document.createElement('div');
        legendItem.className = 'calendar-legend-item';

        const legendColor = document.createElement('div');
        legendColor.className = 'calendar-legend-color';
        legendColor.classList.add(item.class);

        const legendLabel = document.createElement('span');
        legendLabel.textContent = item.label;

        legendItem.appendChild(legendColor);
        legendItem.appendChild(legendLabel);
        legend.appendChild(legendItem);
    });

    calendarContainer.appendChild(legend);
}

//Get the leave dates from the table of absences
function parseLeaveDates() {
    const leaveDates = {};
    //Get all the absences rows
    const rows = document.querySelectorAll('.xjb');
    //For each absence row
    rows.forEach(row => {
        //Get the type of leave
        const leaveType = row.querySelector('.x2ku')?.textContent.toLowerCase();
        //Add class bvased on type of leave
        const leaveClass = leaveType.includes('annual leave') ? 'annual-leave' :
                          leaveType.includes('flexi leave') ? 'flexi-leave' :
                          leaveType.includes('public & privilege holidays') ? 'public-holidays' :
                          leaveType.includes('sickness leave') ? 'sickness-leave' : 
                          leaveType.includes('hours') ? 'other-leave' : 
                          '';
        if (leaveClass) {
            //If we have identified an absence
            const dateSpans = row.querySelectorAll('.x2vz');

            //Parse the start and end dates basd on the format
            const startDateString = dateSpans[0]?.textContent;
            const endDateString = dateSpans[dateSpans.length - 1]?.textContent;
            var startDate = null;
            var endDate = null;
            if(startDateString.length <= 8){
                var dateSplit = startDateString.split("/");
                var d = parseInt(dateSplit[0], 10);
                var m = parseInt(dateSplit[1], 10);
                var y = parseInt(dateSplit[2], 10);
                startDate = new Date(y + 2000, m - 1, d);

                dateSplit = endDateString.split("/");
                var d = parseInt(dateSplit[0], 10);
                var m = parseInt(dateSplit[1], 10);
                var y = parseInt(dateSplit[2], 10);
                endDate = new Date(y + 2000, m - 1, d);
            }
            else{
                startDate = new Date(dateSpans[0]?.textContent);
                endDate = new Date(dateSpans[dateSpans.length - 1]?.textContent);                
            }

            //Create absences for all the dates in between the dates a well
            for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
                const date = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
                if (!leaveDates[date]) {
                    leaveDates[date] = [];
                }
                leaveDates[date].push({
                    class: leaveClass,
                    type: leaveType,
                    start: startDateString,
                    end: endDateString
                });
            }
        }
    });
    return leaveDates;
}

//Show the existing absences yearly calendar
function existingAbsences_showCalendar(){
    //Add calendar dom elements if they don't exist
    addCalendarDom();
    
    //Check if we're already displaying the calendar, and if so, exit;
    var calendarPopup = document.getElementById('calendar-popup');
    if(calendarPopup.style.display == 'block') return;
    
    //Get the current year
    const currentYear = new Date().getFullYear();
    //Get all the leave dates
    const leaveDates = parseLeaveDates();

    //Create the calendar and display it
    createCompactCalendar(currentYear, leaveDates);   
    calendarPopup.style.display = 'block';       
}

/////////////////////////////////////////////////////////////////////////////////////////
// Start Processes
/////////////////////////////////////////////////////////////////////////////////////////

toolTip_addListeners();
timeCard_dailyHoursTotal();
timeCard_showAccurateReportedHours();
webClock_showTotalElaspedTime();
globalNumberChange();

//Calendar is a big so only do this if on the Existing Absences page
document.querySelectorAll('h1').forEach(header => {
    if (header.innerHTML.includes("Existing Absences")) {
        existingAbsences_showCalendar();
    }
});
