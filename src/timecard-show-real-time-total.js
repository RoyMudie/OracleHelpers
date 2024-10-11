const workingHoursPerDay='7';
//Set your number of working hours per day (for part time working, probably best just set at your maximum length of day)

//Convert to bookmarklet
//Time Card - Show Real Total Time (Bookmarket)
//https://caiorss.github.io/bookmarklet-maker/

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

//Get the total number of hours
function getTotalNumberOfHours(){
    var totalHours = 0;
    document.querySelectorAll('.Apps4XLargeFontSize').forEach(function(time) {
        totalHours += parseFloat(time.textContent);
    });
    totalHours = parseFloat(parseFloat(totalHours).toFixed(2));
    return totalHours;
}

function main(){
    //Check if we can find the total value on the page
    var scoreboardDiv = document.querySelector("table[id$='dc_i1:1:dc_pgl11'] .scoreboard-value");
    if (scoreboardDiv == null) return;

    totalHoursDecimal = getTotalNumberOfHours();
    totalHoursDaysHouseMinutes = convertDecimalHoursToDaysHoursMinutes(totalHoursDecimal);
    
    scoreboardDiv.textContent += ` (${totalHoursDecimal}h or ${totalHoursDaysHouseMinutes})`; 
}

main();
