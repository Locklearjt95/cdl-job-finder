
document.addEventListener("DOMContentLoaded", function () {
  const searchButton = document.querySelector("button");
  const distanceSelect = document.querySelector("#distance");
  const payInput = document.querySelector("#pay");
  const homeDailyCheckbox = document.querySelector('input[type="checkbox"]');

  searchButton.addEventListener("click", function () {
    const maxDistance = parseInt(distanceSelect.value);
    const minimumPay = parseInt(payInput.value) || 0;
    const homeDailyOnly = homeDailyCheckbox.checked;

    const matchingJobs = jobs.filter(function (job) {
      const distanceMatch = job.distance <= maxDistance;
      const payMatch = job.weeklyPay >= minimumPay;
      const homeDailyMatch = !homeDailyOnly || job.homeDaily === true;

      return distanceMatch && payMatch && homeDailyMatch;
    });

    console.log("Matching jobs:", matchingJobs);

    alert(
      "Found " +
        matchingJobs.length +
        " CDL job" +
        (matchingJobs.length === 1 ? "" : "s") +
        " matching your filters."
    );
  });
});
