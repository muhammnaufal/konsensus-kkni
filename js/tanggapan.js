// js/tanggapan.js - Logic for Form Tanggapan & Masukan Draft RSKKNI

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formTanggapan');
  const btnDraft = document.getElementById('btnDraftTanggapan');
  const suksesBox = document.getElementById('suksesTanggapanBox');
  const toastWrap = document.getElementById('toastWrap');

  loadDraft();

  if (btnDraft) {
    btnDraft.addEventListener('click', () => {
      saveDraft();
      showToast('Draft lembar tanggapan berhasil disimpan.', 'success');
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        showToast('Mohon lengkapi seluruh kolom wajib bertanda (*)', 'error');
        return;
      }

      const nama = document.getElementById('namaPenanggap').value;
      const instansi = document.getElementById('instansiPenanggap').value;
      const unsur = document.getElementById('unsurPenanggap').value;
      const komisi = document.getElementById('komisi').value;
      const bagDokumen = document.getElementById('bagDokumen').value;
      const jenis = document.getElementById('jenisTanggapan').value;
      const nomorKode = document.getElementById('nomorKode').value;
      const uraianEksisting = document.getElementById('uraianEksisting').value;
      const usulanPerubahan = document.getElementById('usulanPerubahan').value;
      const alasanRasional = document.getElementById('alasanRasional').value;

      const randomId = 'TGP-KKNI-' + Math.floor(1000 + Math.random() * 9000);
      const currentTime = new Date().toLocaleString('id-ID');

      const tanggapanData = {
        id: randomId,
        nama,
        instansi,
        unsur,
        komisi,
        bagDokumen,
        jenis,
        nomorKode,
        uraianEksisting,
        usulanPerubahan,
        alasanRasional,
        submittedAt: currentTime
      };

      const list = JSON.parse(localStorage.getItem('kkni_tanggapan_list') || '[]');
      list.push(tanggapanData);
      localStorage.setItem('kkni_tanggapan_list', JSON.stringify(list));

      // Clear draft
      localStorage.removeItem('kkni_tanggapan_draft');

      // Switch to success view
      form.style.display = 'none';
      if (suksesBox) {
        document.getElementById('tangID').innerText = randomId;
        document.getElementById('tangNama').innerText = nama + ' (' + instansi + ')';
        document.getElementById('tangJenis').innerText = jenis.split(' ')[0];
        document.getElementById('tangKomisi').innerText = komisi;
        suksesBox.style.display = 'block';
      }

      showToast('Masukan & Tanggapan berhasil disimpan!', 'success');
    });
  }

  function saveDraft() {
    const draft = {
      nama: document.getElementById('namaPenanggap')?.value || '',
      instansi: document.getElementById('instansiPenanggap')?.value || '',
      unsur: document.getElementById('unsurPenanggap')?.value || '',
      komisi: document.getElementById('komisi')?.value || '',
      bagDokumen: document.getElementById('bagDokumen')?.value || '',
      jenis: document.getElementById('jenisTanggapan')?.value || '',
      nomorKode: document.getElementById('nomorKode')?.value || '',
      uraianEksisting: document.getElementById('uraianEksisting')?.value || '',
      usulanPerubahan: document.getElementById('usulanPerubahan')?.value || '',
      alasanRasional: document.getElementById('alasanRasional')?.value || ''
    };
    localStorage.setItem('kkni_tanggapan_draft', JSON.stringify(draft));
  }

  function loadDraft() {
    const saved = localStorage.getItem('kkni_tanggapan_draft');
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        if (draft.nama && document.getElementById('namaPenanggap')) document.getElementById('namaPenanggap').value = draft.nama;
        if (draft.instansi && document.getElementById('instansiPenanggap')) document.getElementById('instansiPenanggap').value = draft.instansi;
        if (draft.unsur && document.getElementById('unsurPenanggap')) document.getElementById('unsurPenanggap').value = draft.unsur;
        if (draft.komisi && document.getElementById('komisi')) document.getElementById('komisi').value = draft.komisi;
        if (draft.bagDokumen && document.getElementById('bagDokumen')) document.getElementById('bagDokumen').value = draft.bagDokumen;
        if (draft.jenis && document.getElementById('jenisTanggapan')) document.getElementById('jenisTanggapan').value = draft.jenis;
        if (draft.nomorKode && document.getElementById('nomorKode')) document.getElementById('nomorKode').value = draft.nomorKode;
        if (draft.uraianEksisting && document.getElementById('uraianEksisting')) document.getElementById('uraianEksisting').value = draft.uraianEksisting;
        if (draft.usulanPerubahan && document.getElementById('usulanPerubahan')) document.getElementById('usulanPerubahan').value = draft.usulanPerubahan;
        if (draft.alasanRasional && document.getElementById('alasanRasional')) document.getElementById('alasanRasional').value = draft.alasanRasional;
      } catch (e) {
        console.error(e);
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
