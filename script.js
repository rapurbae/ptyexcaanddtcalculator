function recordTime(phaseId) {
  const now = performance.now() / 1000;
  document.getElementById(phaseId).value = now.toFixed(3);

  const timeDisplayId = {
    startLoading: 'start-loading-time',
    digging: 'digging-time',
    spotting1: 'spotting1-time',
    swingLoad: 'swing-load-time',
    spotting2: 'spotting2-time',
    dumpingExca: 'dumping-exca-time',
    spotting3: 'spotting3-time',
    swingEmpty: 'swing-empty-time',
    spotting4: 'spotting4-time'
  }[phaseId];

  const nowDate = new Date();
  const timeStr = nowDate.toLocaleTimeString('en-GB') + '.' + nowDate.getMilliseconds().toString().padStart(3, '0');
  document.getElementById(timeDisplayId).textContent = timeStr;
}

function resetTimeCall() {
  const ids = ['startLoading', 'digging', 'spotting1', 'swingLoad',
               'spotting2', 'dumpingExca', 'spotting3',
               'swingEmpty', 'spotting4'];
  ids.forEach(id => {
    document.getElementById(id).value = '';
    const textId = id.replace(/([A-Z])/g, "-$1").toLowerCase() + '-time';
    if (document.getElementById(textId)) {
      document.getElementById(textId).textContent = '-';
    }
  });
}

document.getElementById("calc-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const BC = +document.getElementById("bucketCapacity").value;
  const F = +document.getElementById("fillFactor").value;
  const TB = +document.getElementById("totalBucket").value;
  const HD = +document.getElementById("haulingDistance").value;
  const MT = +document.getElementById("manuverTime").value;
  const DTD = +document.getElementById("dumpingTime").value;
  const SL = +document.getElementById("speedLoad").value;
  const SE = +document.getElementById("speedEmpty").value;
  const VC = +document.getElementById("vesselCapacity").value;
  const EFD = +document.getElementById("efisiensiKerjaDumptruck").value;

  const Swell = 0.82;

  const times = [
    +document.getElementById("startLoading").value,
    +document.getElementById("digging").value,
    +document.getElementById("spotting1").value,
    +document.getElementById("swingLoad").value,
    +document.getElementById("spotting2").value,
    +document.getElementById("dumpingExca").value,
    +document.getElementById("spotting3").value,
    +document.getElementById("swingEmpty").value,
    +document.getElementById("spotting4").value
  ];

  const durations = times.slice(1).map((t, i) => t - times[i]);
  const cycleExca = durations.reduce((a, b) => a + b, 0);
  const totalSpotting = durations[1] + durations[3] + durations[5] + durations[7];
  const pureCycle = cycleExca - totalSpotting;
  const effExca = pureCycle / cycleExca;

  const q = BC * F;
  const prodExca = (q * 3600 * effExca * Swell) / cycleExca;
  const loadingTime = cycleExca * TB;
  const travelLoad = (HD / 1000) / SL * 3600;
  const travelEmpty = (HD / 1000) / SE * 3600;
  const cycleDT = loadingTime + travelLoad + travelEmpty + MT + DTD;
  const ritaseHour = 3600 / cycleDT;
  const prodDT = EFD * VC * 3600 * Swell / cycleDT;
  const fleetMatch = prodExca / prodDT;

  document.getElementById("output").innerHTML = `
    <label>Cycle Time Excavator 300 (s)</label>
    <input type="text" value="${cycleExca.toFixed(2)}" readonly>
    <label>Total Spotting Time (s)</label>
    <input type="text" value="${totalSpotting.toFixed(2)}" readonly>
    <label>Efisiensi Kerja Excavator</label>
    <input type="text" value="${effExca.toFixed(2)}" readonly>
    <label>Productivity Excavator (bcm/hour)</label>
    <input type="text" value="${prodExca.toFixed(2)}" readonly>
    <label>Cycle Time Dumptruck (s)</label>
    <input type="text" value="${(cycleDT / 60).toFixed(2)}" readonly>
    <label>Ritase / Hour</label>
    <input type="text" value="${ritaseHour.toFixed(2)}" readonly>
    <label>Dumptruck Productivity (bcm/hour)</label>
    <input type="text" value="${prodDT.toFixed(2)}" readonly>
    <label>Fleet Matching</label>
    <input type="text" value="${fleetMatch.toFixed(2)}" readonly>
  `;
});
