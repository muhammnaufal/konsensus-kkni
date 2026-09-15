// js/ketersediaan.js - Logic for Formulir 13 Kesediaan Peserta Konsensus KKNI

document.addEventListener('DOMContentLoaded', () => {
  // Google Apps Script Web App URL
  const scriptURL = 'https://script.google.com/macros/s/AKfycbz2zCQuI9tJLehAh_gC6OG3ycHxaPrnAmOBF0ly_y7aM9f4rlpA-FQP67PRDNL8EFkB/exec';

  const form = document.getElementById('formData13');
  const submitBtn = document.getElementById('submitBtn13');
  const btnDownloadPdf = document.getElementById('btnDownloadPdf13');
  const suksesBox = document.getElementById('suksesBox');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');
  const toastWrap = document.getElementById('toastWrap');

  // ==========================================
  // 1. Canvas Signature Logic
  // ==========================================
  const canvas = document.getElementById('signature13');
  const btnClearSig = document.getElementById('btnClearSig13');

  let isDrawing = false;
  let hasSigned = false;
  let lastX = 0;
  let lastY = 0;
  let ctx = null;

  if (canvas) {
    ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1A1F36';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    function getCoordinates(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / (rect.width || 1);
      const scaleY = canvas.height / (rect.height || 1);

      let clientX = e.clientX;
      let clientY = e.clientY;

      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    }

    function startDrawing(e) {
      if (e.cancelable && e.type.includes('touch')) e.preventDefault();
      isDrawing = true;
      hasSigned = true;

      ctx.strokeStyle = '#1A1F36';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const { x, y } = getCoordinates(e);
      lastX = x;
      lastY = y;
    }

    function draw(e) {
      if (!isDrawing) return;
      if (e.cancelable && e.type.includes('touch')) e.preventDefault();
      const { x, y } = getCoordinates(e);
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
      lastX = x;
      lastY = y;
    }

    function stopDrawing() {
      isDrawing = false;
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
  }

  if (btnClearSig && canvas) {
    btnClearSig.addEventListener('click', (e) => {
      e.preventDefault();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasSigned = false;
      showToast('Tanda tangan dibersihkan.', 'success');
    });
  }

  // ==========================================
  // Mode Hadir Pills & Conditional Toggle
  // ==========================================
  const modeLabels = document.querySelectorAll('.mode-pill-label');
  modeLabels.forEach(label => {
    label.addEventListener('click', (e) => {
      e.preventDefault();
      modeLabels.forEach(l => l.classList.remove('active'));
      label.classList.add('active');
      const radio = label.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
      }
    });
  });

  const kesediaanSelect = document.getElementById('kesediaan13');
  const modeHadirGroup = document.getElementById('modeHadirGroup');

  function toggleModeHadir() {
    if (kesediaanSelect && modeHadirGroup) {
      if (kesediaanSelect.value === 'Bersedia') {
        modeHadirGroup.style.display = 'block';
      } else {
        modeHadirGroup.style.display = 'none';
      }
    }
  }

  if (kesediaanSelect) {
    kesediaanSelect.addEventListener('change', toggleModeHadir);
    toggleModeHadir();
  }

  // ==========================================
  // 2. Generate PDF Dokumen Formulir 13
  // ==========================================
  if (btnDownloadPdf) {
    btnDownloadPdf.addEventListener('click', () => {
      generateFormulir13PDF();
    });
  }

  function generateFormulir13PDF() {
    if (!window.jspdf) {
      alert('Library jsPDF belum termuat. Pastikan koneksi internet stabil.');
      return;
    }

    const bidang = document.getElementById('bidang13')?.value || '-';
    const nama = document.getElementById('nama13')?.value.trim() || '-';
    const unitKerja = document.getElementById('unitKerja13')?.value.trim() || '-';
    const telp = document.getElementById('telp13')?.value.trim() || '-';
    const kesediaan = document.getElementById('kesediaan13')?.value || 'Bersedia';
    const modeRadio = document.querySelector('input[name="modeHadir"]:checked');
    const modeHadir = modeRadio ? modeRadio.value : 'Daring (Online)';
    const jenisKegiatan = document.getElementById('jenisKegiatan13')?.value || 'Konsensus';
    const sekretaris = document.getElementById('sekretaris13')?.value || 'Eko Mardiono';
    const telpSekretariat = document.getElementById('telpSekretariat13')?.value || '082169092497';
    const fax = document.getElementById('fax13')?.value || '-';
    const kota = document.getElementById('kota13')?.value.trim() || 'Bogor';
    const tanggal = document.getElementById('tanggal13')?.value || new Date().toISOString().split('T')[0];

    window.jsPDF = window.jspdf.jsPDF;
    const doc = new jsPDF();

    // Judul Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('FORMULIR 13 - KESEDIAAN SEBAGAI PESERTA', 105, 18, { align: 'center' });
    doc.setFontSize(12);
    doc.text('KONSENSUS KKNI', 105, 25, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.line(14, 28, 196, 28);

    let y = 38;
    doc.setFontSize(10);

    // Bidang
    doc.setFont('helvetica', 'bold');
    doc.text('Bidang', 14, y);
    doc.text(':', 55, y);
    doc.setFont('helvetica', 'normal');
    doc.text(bidang, 60, y);

    y += 12;
    // Section 1: Yang Bertanda Tangan
    doc.setFont('helvetica', 'bold');
    doc.text('Yang bertanda tangan dibawah ini saya:', 14, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text('Nama', 20, y);
    doc.text(':', 55, y);
    doc.text(nama, 60, y);

    y += 7;
    doc.text('Unit Kerja', 20, y);
    doc.text(':', 55, y);
    doc.text(unitKerja, 60, y);

    y += 7;
    doc.text('No. Telp/HP', 20, y);
    doc.text(':', 55, y);
    doc.text(telp, 60, y);

    y += 7;
    doc.text('Pernyataan Kesediaan', 20, y);
    doc.text(':', 55, y);
    doc.setFont('helvetica', 'bold');
    doc.text(kesediaan, 60, y);

    if (kesediaan === 'Bersedia') {
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.text('Hadir Secara', 20, y);
      doc.text(':', 55, y);
      doc.setFont('helvetica', 'bold');
      doc.text(modeHadir, 60, y);
    }

    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.text('Jenis Kegiatan', 20, y);
    doc.text(':', 55, y);
    doc.text(jenisKegiatan, 60, y);

    y += 12;
    // Section 2: Sekretariat
    doc.setFont('helvetica', 'bold');
    doc.text('Disampaikan kepada Sekretariat Panitia Konsensus', 14, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text('Up. Sdr.', 20, y);
    doc.text(':', 55, y);
    doc.text(sekretaris, 60, y);

    y += 7;
    doc.text('Telp. Sekretariat', 20, y);
    doc.text(':', 55, y);
    doc.text(telpSekretariat, 60, y);

    y += 7;
    doc.text('Fax. Sekretariat', 20, y);
    doc.text(':', 55, y);
    doc.text(fax, 60, y);

    y += 14;
    doc.text(`${kota}, ${tanggal}`, 196, y, { align: 'right' });

    // Signature Area
    y += 10;
    const sigX = 140;

    doc.setFont('helvetica', 'bold');
    doc.text('Yang Menyatakan', sigX + 25, y, { align: 'center' });

    y += 4;
    const imgData = canvas ? canvas.toDataURL('image/png') : '';
    const blank = document.createElement('canvas');
    blank.width = 650;
    blank.height = 160;

    if (imgData && canvas.toDataURL() !== blank.toDataURL()) {
      doc.addImage(imgData, 'PNG', sigX, y, 50, 22);
    }

    y += 26;
    doc.setFont('helvetica', 'normal');
    doc.text(`( ${nama} )`, sigX + 25, y, { align: 'center' });

    const fileName = `Formulir_13_Kesediaan_${nama.replace(/[^a-z0-9]/gi, '_')}.pdf`;
    doc.save(fileName);

    showToast('✅ Dokumen PDF Formulir 13 berhasil didownload!', 'success');
  }

  // ==========================================
  // 3. Form Submit Handler
  // ==========================================
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const bidang = document.getElementById('bidang13')?.value;
      const nama = document.getElementById('nama13')?.value.trim();
      const unitKerja = document.getElementById('unitKerja13')?.value.trim();
      const telp = document.getElementById('telp13')?.value.trim();
      const kesediaan = document.getElementById('kesediaan13')?.value;
      const modeRadio = document.querySelector('input[name="modeHadir"]:checked');
      const modeHadir = kesediaan === 'Bersedia' ? (modeRadio ? modeRadio.value : 'Daring (Online)') : '-';
      const jenisKegiatan = document.getElementById('jenisKegiatan13')?.value;
      const kota = document.getElementById('kota13')?.value.trim();
      const tanggal = document.getElementById('tanggal13')?.value;

      if (!bidang || !nama || !unitKerja || !telp || !kesediaan || !jenisKegiatan || !kota || !tanggal) {
        showToast('Mohon lengkapi seluruh kolom wajib bertanda (*)', 'error');
        alert('Mohon lengkapi seluruh kolom wajib bertanda (*)');
        return;
      }

      // Check canvas signature
      const blank = document.createElement('canvas');
      blank.width = 650;
      blank.height = 160;

      if (!hasSigned || (canvas && canvas.toDataURL() === blank.toDataURL())) {
        showToast('Mohon isi Tanda Tangan terlebih dahulu.', 'error');
        alert('Mohon isi Tanda Tangan terlebih dahulu.');
        return;
      }

      if (submitBtn) {
        submitBtn.innerHTML = '⏳ Sedang Mengirim Formulir...';
        submitBtn.disabled = true;
      }

      if (successMessage) successMessage.style.display = 'none';
      if (errorMessage) errorMessage.style.display = 'none';

      const randomId = 'F13-KKNI-' + Math.floor(1000 + Math.random() * 9000);
      const currentTime = new Date().toLocaleString('id-ID');
      const sigData = canvas ? canvas.toDataURL('image/png') : '';

      const dataToSend = new URLSearchParams();
      dataToSend.append('formType', 'form13');
      dataToSend.append('form_type', 'form13');
      dataToSend.append('id', randomId);
      dataToSend.append('timestamp', currentTime);
      dataToSend.append('bidang', bidang);
      dataToSend.append('nama', nama);
      dataToSend.append('unitKerja', unitKerja);
      dataToSend.append('telp', telp);
      dataToSend.append('kesediaan', kesediaan);
      dataToSend.append('modeHadir', modeHadir);
      dataToSend.append('metode_hadir', modeHadir);
      dataToSend.append('mode_hadir', modeHadir);
      dataToSend.append('hadir_secara', modeHadir);
      dataToSend.append('jenisKegiatan', jenisKegiatan || 'Konsensus');
      dataToSend.append('sekretaris', 'Eko Mardiono');
      dataToSend.append('telpSekretariat', '082169092497');
      dataToSend.append('fax', '-');
      dataToSend.append('kota', kota);
      dataToSend.append('tanggal', tanggal);
      dataToSend.append('signature', sigData);

      // Backup local storage
      const localLog = {
        id: randomId,
        bidang,
        nama,
        unitKerja,
        kesediaan,
        modeHadir,
        submittedAt: currentTime
      };
      const existingLogs = JSON.parse(localStorage.getItem('kkni_ketersediaan_f13_list') || '[]');
      existingLogs.push(localLog);
      localStorage.setItem('kkni_ketersediaan_f13_list', JSON.stringify(existingLogs));

      fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        body: dataToSend
      })
        .then(() => {
          if (successMessage) successMessage.style.display = 'block';
          if (errorMessage) errorMessage.style.display = 'none';
          finishSubmission(nama, unitKerja, kesediaan, bidang, modeHadir);
        })
        .catch(error => {
          console.error(error);
          if (errorMessage) errorMessage.style.display = 'block';
        })
        .finally(() => {
          if (submitBtn) {
            submitBtn.innerHTML = '📤 Kirim Formulir';
            submitBtn.disabled = false;
          }
        });
    });
  }

  function finishSubmission(nama, unitKerja, kesediaan, bidang, modeHadir) {
    if (form) {
      form.reset();
      form.style.display = 'none';
    }

    if (suksesBox) {
      const refNama = document.getElementById('refNama');
      const refUnitKerja = document.getElementById('refUnitKerja');
      const refKesediaan = document.getElementById('refKesediaan');
      const refBidang = document.getElementById('refBidang');
      const refModeHadirRow = document.getElementById('refModeHadirRow');
      const refModeHadir = document.getElementById('refModeHadir');

      if (refNama) refNama.innerText = nama;
      if (refUnitKerja) refUnitKerja.innerText = unitKerja;
      if (refKesediaan) refKesediaan.innerText = kesediaan;
      if (refBidang) refBidang.innerText = bidang;
      if (refModeHadirRow && refModeHadir) {
        if (kesediaan === 'Bersedia') {
          refModeHadir.innerText = modeHadir;
          refModeHadirRow.style.display = 'flex';
        } else {
          refModeHadirRow.style.display = 'none';
        }
      }

      suksesBox.style.display = 'block';
    }
    showToast('✅ Formulir kesediaan berhasil dikirim!', 'success');
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
    }, 3500);
  }
});
