//Convert to bookmarklet
//Web Clock - Show Total Clocked-in Time (Bookmarklet)
//https://caiorss.github.io/bookmarklet-maker/

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

function main(){
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

main();
