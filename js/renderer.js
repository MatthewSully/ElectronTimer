const dismissBtn = document.getElementById("dismissBtn");
const setAlarmBtn = document.getElementById("setAlarmBtn");
const intervalMinutesInput = document.getElementById("intervalMinutesInput");
const intervalSecondsInput = document.getElementById("intervalSecondsInput");
const timeLeftDisplay = document.getElementById("countdown");
const { ipcRenderer } = require("electron");

let alarmTimeout;
let countdownInterval;
let endTime;

function startAlarm(minutes, seconds) {
  clearTimeout(alarmTimeout);
  clearInterval(countdownInterval);

  const alarmDuration = (minutes * 60 + seconds) * 1000; // Convert to milliseconds
  endTime = Date.now() + alarmDuration; // Calculate the end time of the alarm

  alarmTimeout = setTimeout(() => {
    playAlarmSound();
    startAlarm(minutes, seconds); // Restart with the same duration
  }, alarmDuration);

  updateCountdown(); // Initialize the countdown immediately
}

function updateCountdown() {
  clearInterval(countdownInterval); // Ensure no previous countdowns are running

  countdownInterval = setInterval(() => {
    const timeLeft = endTime - Date.now();

    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      timeLeftDisplay.textContent = "00:00";
      return;
    }

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    timeLeftDisplay.textContent = `${pad(minutes)}:${pad(seconds)}`;
  }, 100); // Update the display every 100ms
}

function playAlarmSound() {
  const audio = new Audio("./honking.wav"); // Make sure this path is correct
  audio.play();
  setTimeout(() => {
    audio.pause(); // Stop playing the sound after 3 seconds
    audio.currentTime = 0; // Rewind to the start
  }, 3000);
}

function pad(number) {
  return number < 10 ? "0" + number : number;
}

setAlarmBtn.addEventListener("click", () => {
  const minutesValue = intervalMinutesInput.value;
  const secondsValue = intervalSecondsInput.value;

  // Parse the values, default to 0 if not provided
  const minutes = minutesValue ? parseInt(minutesValue, 10) : 0;
  const seconds = secondsValue ? parseInt(secondsValue, 10) : 0;

  const validMinutes = !isNaN(minutes) && minutes >= 0;
  const validSeconds = !isNaN(seconds) && seconds >= 0;

  // Check if at least one input is valid and not zero
  if ((validMinutes || validSeconds) && (minutes > 0 || seconds > 0)) {
    startAlarm(minutes, seconds);
  } else {
    alert("Please enter a valid number for either minutes or seconds.");
  }
});

dismissBtn.addEventListener("click", () => {
  clearTimeout(alarmTimeout);
  clearInterval(countdownInterval);
  timeLeftDisplay.textContent = "--:--";
});

document.getElementById("collapseBtn").addEventListener("click", () => {
  ipcRenderer.send("collapse-window");
});

document.getElementById("countdown").addEventListener("click", (event) => {
  ipcRenderer.send("toggle-collapse");
});
