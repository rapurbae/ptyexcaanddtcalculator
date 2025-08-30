function recordTime(phaseId) {
  const now = performance.now() / 1000; // detik sejak page load
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
    spotting4: 'spotting4-time',
    startLoadingdt: 'start-loading-time-dt',
    manuver: 'manuver-time'
  }[phaseId];

  const nowDate = new Date();
  const timeStr = nowDate.toLocaleTimeString('en-GB') + '.' +
    nowDate.getMilliseconds().toString().padStart(3, '0');
  document.getElementById(timeDisplayId).textContent = timeStr;
}

function resetTimeCall() {
  const ids = [
    'startLoading','digging','spotting1','swingLoad',
    'spotting2','dumpingExca','spotting3','swingEmpty','spotting4',
    'startLoadingdt','manuver'
  ];

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

  // input utama
  const BC = +document.getElementById("bucketCapacity").value;
  const F = +document.getElementById("fillFactor").value;
  const VC = +document.getElementById("vesselCapacity").value;
  const Swell = 0.82;

  // ambil timestamp excavator
  const timesExca = [
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

  const durationsExca = [];
  for (let i = 1; i < timesExca.length; i++) {
    if (timesExca[i] && timesExca[i-1]) {
      durationsExca.push(timesExca[i] - timesExca[i-1]);
    } else {
      durationsExca.push(0);
    }
  }

  const diggingTime   = durationsExca[0];
  const spotting1Time = durationsExca[1];
  const swingLoadTime = durationsExca[2];
  const spotting2Time = durationsExca[3];
  const dumpingTime   = durationsExca[4];
  const spotting3Time = durationsExca[5];
  const swingEmptyTime= durationsExca[6];
  const spotting4Time = durationsExca[7];

  const cycleExca = diggingTime + spotting1Time + swingLoadTime +
                    spotting2Time + dumpingTime + spotting3Time +
                    swingEmptyTime + spotting4Time;

  const totalSpotting = spotting1Time + spotting2Time + spotting3Time + spotting4Time;
  const pureCycleExca = cycleExca - totalSpotting;
  const effExca = (cycleExca > 0) ? pureCycleExca / cycleExca : 0;

  const q = BC * F;
  const prodExca = (cycleExca > 0) ?
    (q * 3600 * effExca * Swell) / cycleExca : 0;

  const startDT = +document.getElementById("startLoadingdt").value;
  const manuverDT = +document.getElementById("manuver").value;

  let cycleDT = 0;  
  if (manuverDT && startDT) {
    cycleDT = manuverDT - startDT;
  }

  const prodDT = (cycleDT > 0) ?
    (VC * 3600 * Swell) / cycleDT : 0;

  const ritaseHour = (cycleDT > 0) ? 60 / (cycleDT / 60) : 0;

  const fleetMatch = (prodDT > 0) ? prodExca / prodDT : 0;

  fetch("https://script.google.com/macros/s/AKfycbwAZ93T521tA0gI7eWfgCac1RwU6OBn5n6-nEAtd1-mxj7dpVZ5CjCInVXRy5j4umDg2g/exec", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        material: "ob",
        excavator300: document.getElementById("excavator300").value,
        area: document.getElementById("area").value,
        cuaca: document.getElementById("cuaca").value,
        cycleExca: cycleExca.toFixed(2),
        totalSpottingTime: totalSpottingTime.toFixed(2),
        effExca: effExca.toFixed(4),
        prodExca: prodExca.toFixed(2),
        cycleDT: cycleDT.toFixed(2),
        ritaseHour: ritaseHour.toFixed(2),
        prodDT: prodDT.toFixed(2),
        prodDTTon: prodDTTon.toFixed(2),
        fleetMatch: fleetMatch.toFixed(2)  
      })
    });

  // tampilkan output
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
