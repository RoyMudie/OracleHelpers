const workingHoursPerDay='7';
//Set your number of working hours per day (for part time working, probably best just set at your maximum length of day)

//Convert to bookmarklet
//Enable Decimal Hours Converter Tooltip (Bookmarket)
//https://caiorss.github.io/bookmarklet-maker/

//Define the tooltip appearance
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

// Add event listeners
document.addEventListener('mouseup', showTooltip);
document.addEventListener('mousedown', hideTooltip);
