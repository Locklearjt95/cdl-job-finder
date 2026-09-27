document.addEventListener("DOMContentLoaded", function () {
  const locationInput = document.querySelector("#location");
  const results = document.querySelector("#results");
  const searchButton = document.querySelector("button");
  const defaultOrigin = { latitude: 34.77415, longitude: -79.462776, label: "Laurinburg, NC" };
  const geocoderUrl = "https://nominatim.openstreetmap.org/search";

  function straightLineMiles(from, to) {
    const radians = (degrees) => degrees * Math.PI / 180;
    const latitudeDifference = radians(to.latitude - from.latitude);
    const longitudeDifference = radians(to.longitude - from.longitude);
    const arc = Math.sin(latitudeDifference / 2) ** 2 +
      Math.cos(radians(from.latitude)) * Math.cos(radians(to.latitude)) *
      Math.sin(longitudeDifference / 2) ** 2;
    return 3958.8 * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
  }

  async function resolveOrigin(input) {
    const query = input.trim();
    if (!query || /^laurinburg,?\s*(nc|north carolina)$/i.test(query)) return defaultOrigin;
    // Only resolve one location when someone presses Search. Cache repeat searches.
    if (!/^\d{5}$/.test(query) && !/^[a-z .'-]+,\s*[a-z .'-]{2,}$/i.test(query)) {
      throw new Error("Enter a city and state (such as Raleigh, NC) or a five-digit ZIP code.");
    }
    const key = `cdl-place:${query.toLowerCase().replace(/\s+/g, " ")}`;
    try {
      const cached = JSON.parse(localStorage.getItem(key));
      if (cached && Number.isFinite(cached.latitude) && Number.isFinite(cached.longitude)) return cached;
    } catch (_) { /* Storage may be unavailable; search still works. */ }

    const url = new URL(geocoderUrl);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("countrycodes", "us");
    url.searchParams.set("limit", "1");
    if (/^\d{5}$/.test(query)) {
      url.searchParams.set("postalcode", query);
    } else {
      const [city, state] = query.split(/,\s*/, 2);
      url.searchParams.set("city", city.trim());
      url.searchParams.set("state", state.trim());
    }
    const response = await fetch(url.toString(), { headers: { "Accept-Language": "en-US" } });
    if (!response.ok) throw new Error("Location lookup is temporarily unavailable. Please try again.");
    const places = await response.json();
    if (!places.length) throw new Error("Location not found. Check the city and state or ZIP code.");
    const origin = {
      latitude: Number(places[0].lat),
      longitude: Number(places[0].lon),
      label: query
    };
    if (!Number.isFinite(origin.latitude) || !Number.isFinite(origin.longitude)) {
      throw new Error("Location lookup is temporarily unavailable. Please try again.");
    }
    try { localStorage.setItem(key, JSON.stringify(origin)); } catch (_) { /* Optional cache. */ }
    return origin;
  }

  searchButton.addEventListener("click", async function () {
    results.replaceChildren();
    searchButton.disabled = true;
    results.textContent = "Finding jobs…";
    let origin;
    try {
      origin = await resolveOrigin(locationInput.value);
    } catch (error) {
      results.textContent = error instanceof TypeError
        ? "Location lookup is unavailable. Please try again."
        : error.message;
      searchButton.disabled = false;
      return;
    }
    searchButton.disabled = false;
    results.replaceChildren();

    const maxDistance = parseInt(document.querySelector("#distance").value, 10);
    const minimumPay = Number(document.querySelector("#pay").value) || 0;
    const homeDailyOnly = document.querySelector("#homeDaily").checked;
    const startTime = document.querySelector("#startTime").value;
    const matchingJobs = jobs.filter(function (job) {
      return Number.isFinite(job.latitude) && Number.isFinite(job.longitude) &&
        straightLineMiles(origin, job) <= maxDistance &&
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
        ["Location", `${job.location} · about ${Math.round(straightLineMiles(origin, job))} straight-line miles from ${origin.label}`],
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
