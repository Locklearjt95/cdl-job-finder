document.addEventListener("DOMContentLoaded", function () {
  const locationInput = document.querySelector("#location");
  const results = document.querySelector("#results");

  document.querySelector("button").addEventListener("click", function () {
    results.replaceChildren();
    const location = locationInput.value.trim();
    if (location && !/^laurinburg(?:,?\s*(?:nc|north carolina))?$/i.test(location)) {
      results.textContent = "Distance is currently measured from Laurinburg, NC. Search from Laurinburg or leave Location blank.";
      return;
    }

    const maxDistance = parseInt(document.querySelector("#distance").value, 10);
    const minimumPay = Number(document.querySelector("#pay").value) || 0;
    const homeDailyOnly = document.querySelector("#homeDaily").checked;
    const startTime = document.querySelector("#startTime").value;
    const matchingJobs = jobs.filter(function (job) {
      return Number.isFinite(job.distance) && job.distance <= maxDistance &&
        (minimumPay === 0 || (Number.isFinite(job.weeklyPay) && job.weeklyPay >= minimumPay)) &&
        (!homeDailyOnly || job.homeDaily === true) &&
        (startTime === "any" || job.startTimeCategory === startTime);
    });

    if (!matchingJobs.length) {
      results.textContent = jobs.length
        ? "No verified CDL jobs match those filters."
        : "No verified job listings have been added yet. Check back for direct application links.";
      return;
    }

    matchingJobs.forEach(function (job) {
      const card = document.createElement("article");
      card.className = "job-card";
      const heading = document.createElement("h3");
      heading.textContent = job.title;
      card.appendChild(heading);
      const company = document.createElement("strong");
      company.textContent = job.company;
      card.appendChild(company);
      const details = [
        ["Location", `${job.location} · ${job.distance} miles from Laurinburg`],
        ["Pay", job.payText ?? (Number.isFinite(job.weeklyPay) ? `$${job.weeklyPay.toLocaleString()}/week` : null)],
        ["Home daily", job.homeDaily ? "Yes" : "Not confirmed"],
        ["Schedule", job.schedule], ["Start time", job.startTime],
        ["Equipment", job.equipment], ["Freight", job.freight]
      ];
      if (job.tanker) details.push(["Tanker", "Yes"]);
      if (job.hazmat) details.push(["Hazmat", "Yes"]);
      details.forEach(function ([label, value]) {
        const line = document.createElement("p");
        line.textContent = `${label}: ${value ?? "Not listed"}`;
        card.appendChild(line);
      });
      if (job.sourceUrl && /^https:\/\//.test(job.sourceUrl)) {
        const source = document.createElement("a");
        source.href = job.sourceUrl;
        source.target = "_blank";
        source.rel = "noopener noreferrer";
        source.textContent = "View employer listing";
        card.appendChild(source);
        card.appendChild(document.createTextNode(" · "));
      }
      if (job.applyUrl && /^https:\/\//.test(job.applyUrl)) {
        const link = document.createElement("a");
        link.href = job.applyUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Apply directly";
        card.appendChild(link);
      }
      results.appendChild(card);
    });
  });
});
