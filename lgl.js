document.addEventListener("DOMContentLoaded", function () {
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

  window.recordTime = recordTime;
  window.resetTimeCall = resetTimeCall;

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

    const Swell = 0.93;
    const Density = 1.578;

    // Ambil waktu dalam detik
    const startLoading = +document.getElementById("startLoading").value;
    const digging = +document.getElementById("digging").value;
    const spotting1 = +document.getElementById("spotting1").value;
    const swingLoad = +document.getElementById("swingLoad").value;
    const spotting2 = +document.getElementById("spotting2").value;
    const dumpingExca = +document.getElementById("dumpingExca").value;
    const spotting3 = +document.getElementById("spotting3").value;
    const swingEmpty = +document.getElementById("swingEmpty").value;
    const spotting4 = +document.getElementById("spotting4").value;

    // Validasi input waktu
    const allTimes = [startLoading, digging, spotting1, swingLoad, spotting2, dumpingExca, spotting3, swingEmpty, spotting4];
    if (allTimes.some(t => t === 0 || isNaN(t))) {
      alert("Lengkapi semua pencatatan waktu sebelum menghitung.");
      return;
    }

    // Hitung durasi masing-masing tahapan
    const dDig = digging - startLoading;
    const dSpot1 = spotting1 - digging;
    const dSwingL = swingLoad - spotting1;
    const dSpot2 = spotting2 - swingLoad;
    const dDumpExca = dumpingExca - spotting2;
    const dSpot3 = spotting3 - dumpingExca;
    const dSwingE = swingEmpty - spotting3;
    const dSpot4 = spotting4 - swingEmpty;

    const cycleExca = dDig + dSpot1 + dSwingL + dSpot2 + dDumpExca + dSpot3 + dSwingE + dSpot4;
    const totalSpottingTime = dSpot1 + dSpot2 + dSpot3 + dSpot4;
    const pureCycle = cycleExca - totalSpottingTime;
    const effExca = pureCycle / cycleExca;

    const q = BC * F;
    const prodExca = (q * 3600 * effExca * Swell) / cycleExca;
    const prodExcaTon = prodExca * Density;

    const loadingTime = cycleExca * TB;
    const travelLoad = (HD / 1000) / SL * 3600;
    const travelEmpty = (HD / 1000) / SE * 3600;
    const cycleDT = loadingTime + travelLoad + travelEmpty + MT + DTD;
    const ritaseHour = 3600 / cycleDT;
    const prodDT = EFD * VC * 3600 * Swell / cycleDT;
    const prodDTTon = prodDT * Density;
    const fleetMatch = prodExcaTon / prodDTTon;

    document.getElementById("output").innerHTML = `
      <label>Cycle Time Excavator 300 (s)</label>
      <input type="text" value="${cycleExca.toFixed(2)}" readonly>

      <label>Total Spotting Time (s)</label>
      <input type="text" value="${totalSpottingTime.toFixed(2)}" readonly>

      <label>Efisiensi Kerja Excavator</label>
      <input type="text" value="${effExca.toFixed(4)}" readonly>

      <label>Productivity Excavator (bcm/hour)</label>
      <input type="text" value="${prodExca.toFixed(2)}" readonly>

      <label>Cycle Time Dumptruck (s)</label>
      <input type="text" value="${cycleDT.toFixed(2)}" readonly>

      <label>Ritase / Hour</label>
      <input type="text" value="${ritaseHour.toFixed(2)}" readonly>

      <label>Dumptruck Productivity (Ton/hour)</label>
      <input type="text" value="${prodDTTon.toFixed(2)}" readonly>

      <label>Fleet Matching</label>
      <input type="text" value="${fleetMatch.toFixed(2)}" readonly>
    `;
  });
});
