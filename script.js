document.addEventListener("DOMContentLoaded", function () {
  const searchButton = document.querySelector("button");
  const distanceSelect = document.querySelector("#distance");
  const payInput = document.querySelector("#pay");
  const homeDailyCheckbox = document.querySelector('input[type="checkbox"]');
  const startTimeSelect = document.querySelector("#startTime");
  const results = document.querySelector("#results");

  searchButton.addEventListener("click", function () {
    const maxDistance = parseInt(distanceSelect.value);
    const minimumPay = parseInt(payInput.value) || 0;
    const homeDailyOnly = homeDailyCheckbox.checked;
    const preferredStartTime = startTimeSelect.value;

    const matchingJobs = jobs.filter(function (job) {
      const distanceMatch = job.distance <= maxDistance;
      const payMatch = job.weeklyPay >= minimumPay;
      const homeDailyMatch = !homeDailyOnly || job.homeDaily === true;
 const startTimeMatch =
  preferredStartTime === "any" ||
  job.startTimeCategory === preferredStartTime;


  return distanceMatch && payMatch && homeDailyMatch && startTimeMatch;
    });

    results.innerHTML = "";

    if (matchingJobs.length === 0) {
      results.innerHTML = "<p>No CDL jobs match those filters.</p>";
      return;
    }

    matchingJobs.forEach(function (job) {
      const jobCard = document.createElement("div");
      jobCard.className = "job-card";

      jobCard.innerHTML = `
        <h3>${job.title}</h3>
        <strong>${job.company}</strong>
        <p>📍 ${job.location} — ${job.distance} miles away</p>
        <p>💰 $${job.weeklyPay.toLocaleString()} per week</p>
        <p>🏠 Home Daily: ${job.homeDaily ? "Yes" : "No"}</p>
        <p>📅 Schedule: ${job.schedule}</p>
        <p>🕐 Start Time: ${job.startTime}</p>
        <p>🚛 Equipment: ${job.equipment}</p>
        <p>📦 Freight: ${job.freight}</p>
      `;
if (job.tanker) {
  jobCard.innerHTML += `<p>🛢️ Tanker: Yes</p>`;
}

if (job.hazmat) {
  jobCard.innerHTML += `<p>⚠️ Hazmat: Yes</p>`;
}
      results.appendChild(jobCard);
    });
  });
});
