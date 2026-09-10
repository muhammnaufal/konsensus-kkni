// js/keterwakilan.js - Logic & Live Quorum Calculator for Form Rekapitulasi Keterwakilan

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formKeterwakilan');
  const calcInputs = document.querySelectorAll('.input-calc');
  const totalDisplay = document.getElementById('totalHitungPeserta');
  const unsurCountDisplay = document.getElementById('unsurLengkapCount');
  const persenDisplay = document.getElementById('persenKuorumVal');
  const statusBadge = document.getElementById('statusKuorumBadge');
  const suksesBox = document.getElementById('suksesRekapBox');
  const toastWrap = document.getElementById('toastWrap');

  // Trigger calculation on input change
  calcInputs.forEach(input => {
    input.addEventListener('input', calculateQuorum);
  });

  // Run initial calculation
  calculateQuorum();

  function calculateQuorum() {
    const industri = parseInt(document.getElementById('cntIndustri')?.value || '0', 10);
    const akademisi = parseInt(document.getElementById('cntAkademisi')?.value || '0', 10);
    const asosiasi = parseInt(document.getElementById('cntAsosiasi')?.value || '0', 10);
    const pakar = parseInt(document.getElementById('cntPakar')?.value || '0', 10);
    const pemerintah = parseInt(document.getElementById('cntPemerintah')?.value || '0', 10);

    const total = industri + akademisi + asosiasi + pakar + pemerintah;

    // Count how many categories have > 0 participants
    let activeCategories = 0;
    if (industri > 0) activeCategories++;
    if (akademisi > 0) activeCategories++;
    if (asosiasi > 0) activeCategories++;
    if (pakar > 0) activeCategories++;
    if (pemerintah > 0) activeCategories++;

    // Target quorum percentage rule (e.g. min 50 total & 5/5 categories)
    const quorumPercentage = total > 0 ? Math.min(100, Math.round((total / 150) * 100 * 10) / 10) : 0;
    const isQuorumSah = activeCategories >= 5 && total >= 30;

    if (totalDisplay) totalDisplay.innerText = total;
    if (unsurCountDisplay) unsurCountDisplay.innerText = `${activeCategories} / 5`;
    if (persenDisplay) persenDisplay.innerText = `${quorumPercentage}%`;

    if (statusBadge) {
      if (isQuorumSah) {
        statusBadge.className = 'badge badge-success';
        statusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> KUORUM TERPENUHI (SAH)';
      } else {
        statusBadge.className = 'badge badge-warning';
        statusBadge.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> BELUM KUORUM';
      }
    }
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        showToast('Mohon isi seluruh field wajib!', 'error');
        return;
      }

      const petugas = document.getElementById('namaVerifikator').value;
      const total = totalDisplay ? totalDisplay.innerText : '0';
      const randomId = 'BA-KTR-' + Math.floor(1000 + Math.random() * 9000);
      const currentTime = new Date().toLocaleString('id-ID');

      const rekapData = {
        id: randomId,
        petugas,
        totalPeserta: total,
        industri: document.getElementById('cntIndustri')?.value || 0,
        akademisi: document.getElementById('cntAkademisi')?.value || 0,
        asosiasi: document.getElementById('cntAsosiasi')?.value || 0,
        pakar: document.getElementById('cntPakar')?.value || 0,
        pemerintah: document.getElementById('cntPemerintah')?.value || 0,
        catatan: document.getElementById('catatanVerifikasi')?.value || '',
        submittedAt: currentTime
      };

      const existing = JSON.parse(localStorage.getItem('kkni_keterwakilan_list') || '[]');
      existing.push(rekapData);
      localStorage.setItem('kkni_keterwakilan_list', JSON.stringify(existing));

      // Switch view
      form.style.display = 'none';
      if (suksesBox) {
        document.getElementById('rekapID').innerText = randomId;
        document.getElementById('rekapTotal').innerText = `${total} Pesensus Terdaftar`;
        document.getElementById('rekapPetugas').innerText = petugas;
        suksesBox.style.display = 'block';
      }

      showToast('Rekapitulasi keterwakilan berhasil disahkan!', 'success');
    });
  }

  function showToast(message, type = 'success') {
    if (!toastWrap) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'toast-success' : 'toast-error'}`;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i> <span>${message}</span>`;
    toastWrap.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
});
