// js/konfirmasi.js - Logic for Form Konfirmasi Kehadiran

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formKonfirmasi');
  const btnDraft = document.getElementById('btnDraft');
  const suksesBox = document.getElementById('suksesBox');
  const toastWrap = document.getElementById('toastWrap');

  // Load saved draft if available
  loadDraft();

  // Save Draft Button Handler
  if (btnDraft) {
    btnDraft.addEventListener('click', () => {
      saveDraft();
      showToast('Draft konfirmasi berhasil disimpan sementara.', 'success');
    });
  }

  // Form Submit Handler
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        showToast('Mohon lengkapi seluruh kolom wajib bertanda (*)', 'error');
        return;
      }

      const nama = document.getElementById('namaLengkap').value;
      const nip = document.getElementById('nipNik').value;
      const instansi = document.getElementById('instansi').value;
      const modeHadir = document.querySelector('input[name="modeHadir"]:checked')?.value || 'Luring';
      
      // Generate random registration reference
      const randomId = 'REG-KKNI-' + Math.floor(1000 + Math.random() * 9000);
      const currentTime = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

      // Save submission record
      const submissionData = {
        id: randomId,
        nama,
        nip,
        instansi,
        modeHadir,
        submittedAt: currentTime
      };

      const existingLogs = JSON.parse(localStorage.getItem('kkni_konfirmasi_list') || '[]');
      existingLogs.push(submissionData);
      localStorage.setItem('kkni_konfirmasi_list', JSON.stringify(existingLogs));

      // Clear draft
      localStorage.removeItem('kkni_konfirmasi_draft');

      // UI Switch to Success State
      form.style.display = 'none';
      if (suksesBox) {
        document.getElementById('refCode').innerText = randomId;
        document.getElementById('refMode').innerText = modeHadir.includes('Luring') ? 'Luring (Ballroom)' : 'Daring (Zoom)';
        document.getElementById('refTime').innerText = currentTime + ' WIB';
        suksesBox.style.display = 'block';
      }

      showToast('Konfirmasi kehadiran berhasil terkirim!', 'success');
    });
  }

  function saveDraft() {
    const draft = {
      nama: document.getElementById('namaLengkap')?.value || '',
      nip: document.getElementById('nipNik')?.value || '',
      instansi: document.getElementById('instansi')?.value || '',
      jabatan: document.getElementById('jabatan')?.value || '',
      email: document.getElementById('email')?.value || '',
      whatsapp: document.getElementById('whatsapp')?.value || '',
      catatan: document.getElementById('catatan')?.value || ''
    };
    localStorage.setItem('kkni_konfirmasi_draft', JSON.stringify(draft));
  }

  function loadDraft() {
    const saved = localStorage.getItem('kkni_konfirmasi_draft');
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        if (draft.nama && document.getElementById('namaLengkap')) document.getElementById('namaLengkap').value = draft.nama;
        if (draft.nip && document.getElementById('nipNik')) document.getElementById('nipNik').value = draft.nip;
        if (draft.instansi && document.getElementById('instansi')) document.getElementById('instansi').value = draft.instansi;
        if (draft.jabatan && document.getElementById('jabatan')) document.getElementById('jabatan').value = draft.jabatan;
        if (draft.email && document.getElementById('email')) document.getElementById('email').value = draft.email;
        if (draft.whatsapp && document.getElementById('whatsapp')) document.getElementById('whatsapp').value = draft.whatsapp;
        if (draft.catatan && document.getElementById('catatan')) document.getElementById('catatan').value = draft.catatan;
      } catch (err) {
        console.error('Failed to parse draft', err);
      }
    }
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
