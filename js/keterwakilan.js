// js/keterwakilan.js - Logic for Formulir 14 Keterwakilan Peserta Konsensus KKNI

document.addEventListener('DOMContentLoaded', () => {
  // Google Apps Script Web App URL
  const scriptURL = 'https://script.google.com/macros/s/AKfycbz2zCQuI9tJLehAh_gC6OG3ycHxaPrnAmOBF0ly_y7aM9f4rlpA-FQP67PRDNL8EFkB/exec';

  const form = document.getElementById('formData14');
  const submitBtn = document.getElementById('submitBtn14');
  const btnDownloadPdf = document.getElementById('btnDownloadPdf');
  const suksesBox = document.getElementById('suksesBox');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');
  const toastWrap = document.getElementById('toastWrap');

  // ==========================================
  // 1. Dual Canvas Signature Logic
  // ==========================================
  const canvas1 = document.getElementById('signature14-1');
  const canvas2 = document.getElementById('signature14-2');
  const btnClearSig1 = document.getElementById('btnClearSig1');
  const btnClearSig2 = document.getElementById('btnClearSig2');

  const sigState = {
    canvas1: { isDrawing: false, hasSigned: false, lastX: 0, lastY: 0, ctx: null },
    canvas2: { isDrawing: false, hasSigned: false, lastX: 0, lastY: 0, ctx: null }
  };

  function setupCanvas(canvasEl, stateKey) {
    if (!canvasEl) return;
    const state = sigState[stateKey];
    state.ctx = canvasEl.getContext('2d');
    state.ctx.strokeStyle = '#1A1F36';
    state.ctx.lineWidth = 2.5;
    state.ctx.lineCap = 'round';
    state.ctx.lineJoin = 'round';

    function getCoordinates(e) {
      const rect = canvasEl.getBoundingClientRect();
      const scaleX = canvasEl.width / (rect.width || 1);
      const scaleY = canvasEl.height / (rect.height || 1);

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
      state.isDrawing = true;
      state.hasSigned = true;

      state.ctx.strokeStyle = '#1A1F36';
      state.ctx.lineWidth = 2.5;
      state.ctx.lineCap = 'round';
      state.ctx.lineJoin = 'round';

      const { x, y } = getCoordinates(e);
      state.lastX = x;
      state.lastY = y;
    }

    function draw(e) {
      if (!state.isDrawing) return;
      if (e.cancelable && e.type.includes('touch')) e.preventDefault();
      const { x, y } = getCoordinates(e);
      state.ctx.beginPath();
      state.ctx.moveTo(state.lastX, state.lastY);
      state.ctx.lineTo(x, y);
      state.ctx.stroke();
      state.lastX = x;
      state.lastY = y;
    }

    function stopDrawing() {
      state.isDrawing = false;
    }

    canvasEl.addEventListener('mousedown', startDrawing);
    canvasEl.addEventListener('mousemove', draw);
    canvasEl.addEventListener('mouseup', stopDrawing);
    canvasEl.addEventListener('mouseout', stopDrawing);

    canvasEl.addEventListener('touchstart', startDrawing, { passive: false });
    canvasEl.addEventListener('touchmove', draw, { passive: false });
    canvasEl.addEventListener('touchend', stopDrawing);
  }

  setupCanvas(canvas1, 'canvas1');
  setupCanvas(canvas2, 'canvas2');

  if (btnClearSig1 && canvas1) {
    btnClearSig1.addEventListener('click', (e) => {
      e.preventDefault();
      sigState.canvas1.ctx.clearRect(0, 0, canvas1.width, canvas1.height);
      sigState.canvas1.hasSigned = false;
      showToast('Tanda Tangan Yang Diwakili dibersihkan.', 'success');
    });
  }

  if (btnClearSig2 && canvas2) {
    btnClearSig2.addEventListener('click', (e) => {
      e.preventDefault();
      sigState.canvas2.ctx.clearRect(0, 0, canvas2.width, canvas2.height);
      sigState.canvas2.hasSigned = false;
      showToast('Tanda Tangan Yang Mewakili dibersihkan.', 'success');
    });
  }

  // ==========================================
  // 2. Generate PDF Dokumen Formulir 14
  // ==========================================
  if (btnDownloadPdf) {
    btnDownloadPdf.addEventListener('click', () => {
      generateFormulir14PDF();
    });
  }

  function generateFormulir14PDF() {
    if (!window.jspdf) {
      alert('Library jsPDF belum termuat. Pastikan koneksi internet stabil.');
      return;
    }

    const bidang = document.getElementById('bidang14')?.value || '-';
    const namaPerwakilan = document.getElementById('namaPerwakilan')?.value.trim() || '-';
    const unitKerjaPerwakilan = document.getElementById('unitKerjaPerwakilan')?.value.trim() || '-';
    const telpPerwakilan = document.getElementById('telpPerwakilan')?.value.trim() || '-';

    const namaDiwakili = document.getElementById('namaDiwakili')?.value.trim() || '-';
    const unitKerjaDiwakili = document.getElementById('unitKerjaDiwakili')?.value.trim() || '-';
    const telpDiwakili = document.getElementById('telpDiwakili')?.value.trim() || '-';

    const jenisKegiatan = document.getElementById('jenisKegiatan14')?.value || 'Konsensus';
    const sekretaris = document.getElementById('sekretaris14')?.value || 'Eko Mardiono';
    const telpSekretariat = document.getElementById('telpSekretariat14')?.value || '082169092497';
    const fax = document.getElementById('fax14')?.value || '-';
    const kota = document.getElementById('kota14')?.value.trim() || 'Bogor';
    const tanggal = document.getElementById('tanggal14')?.value || new Date().toISOString().split('T')[0];

    window.jsPDF = window.jspdf.jsPDF;
    const doc = new jsPDF();

    // Judul Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('FORMULIR 14 - KETERWAKILAN SEBAGAI PESERTA', 105, 18, { align: 'center' });
    doc.setFontSize(12);
    doc.text('KONSENSUS KKNI', 105, 25, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.line(14, 28, 196, 28);

    let y = 36;
    doc.setFontSize(10);

    // Bidang
    doc.setFont('helvetica', 'bold');
    doc.text('Bidang', 14, y);
    doc.text(':', 55, y);
    doc.setFont('helvetica', 'normal');
    doc.text(bidang, 60, y);

    y += 10;
    // Section 1: Yang Mewakili
    doc.setFont('helvetica', 'bold');
    doc.text('Yang bertanda tangan dibawah ini (Yang Mewakili):', 14, y);

    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.text('Nama', 20, y);
    doc.text(':', 55, y);
    doc.text(namaPerwakilan, 60, y);

    y += 6;
    doc.text('Unit Kerja', 20, y);
    doc.text(':', 55, y);
    doc.text(unitKerjaPerwakilan, 60, y);

    y += 6;
    doc.text('No. Telp/HP', 20, y);
    doc.text(':', 55, y);
    doc.text(telpPerwakilan, 60, y);

    y += 10;
    // Section 2: Yang Diwakili
    doc.setFont('helvetica', 'bold');
    doc.text('Dengan ini mewakili kepesertaan saya kepada (Yang Diwakili):', 14, y);

    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.text('Nama', 20, y);
    doc.text(':', 55, y);
    doc.text(namaDiwakili, 60, y);

    y += 6;
    doc.text('Unit Kerja', 20, y);
    doc.text(':', 55, y);
    doc.text(unitKerjaDiwakili, 60, y);

    y += 6;
    doc.text('No. Telp/HP', 20, y);
    doc.text(':', 55, y);
    doc.text(telpDiwakili, 60, y);

    y += 6;
    doc.text('Jenis Kegiatan', 20, y);
    doc.text(':', 55, y);
    doc.text(jenisKegiatan, 60, y);

    y += 10;
    // Section 3: Sekretariat
    doc.setFont('helvetica', 'bold');
    doc.text('Disampaikan kepada Sekretariat Panitia Konsensus', 14, y);

    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.text('Up. Sdr.', 20, y);
    doc.text(':', 55, y);
    doc.text(sekretaris, 60, y);

    y += 6;
    doc.text('Telp. Sekretariat', 20, y);
    doc.text(':', 55, y);
    doc.text(telpSekretariat, 60, y);

    y += 6;
    doc.text('Fax. Sekretariat', 20, y);
    doc.text(':', 55, y);
    doc.text(fax, 60, y);

    y += 12;
    doc.text(`${kota}, ${tanggal}`, 196, y, { align: 'right' });

    // Dual Signatures Area
    y += 10;
    const sig1X = 25;
    const sig2X = 125;

    doc.setFont('helvetica', 'bold');
    doc.text('Tanda Tangan Yang Diwakili', sig1X + 25, y, { align: 'center' });
    doc.text('Tanda Tangan Yang Mewakili', sig2X + 25, y, { align: 'center' });

    y += 4;
    const img1 = canvas1 ? canvas1.toDataURL('image/png') : '';
    const img2 = canvas2 ? canvas2.toDataURL('image/png') : '';

    const blank = document.createElement('canvas');
    blank.width = 650;
    blank.height = 160;

    if (img1 && canvas1.toDataURL() !== blank.toDataURL()) {
      doc.addImage(img1, 'PNG', sig1X, y, 50, 22);
    }
    if (img2 && canvas2.toDataURL() !== blank.toDataURL()) {
      doc.addImage(img2, 'PNG', sig2X, y, 50, 22);
    }

    y += 26;
    doc.setFont('helvetica', 'normal');
    doc.text(`( ${namaDiwakili} )`, sig1X + 25, y, { align: 'center' });
    doc.text(`( ${namaPerwakilan} )`, sig2X + 25, y, { align: 'center' });

    const fileName = `Formulir_14_Keterwakilan_${namaPerwakilan.replace(/[^a-z0-9]/gi, '_')}.pdf`;
    doc.save(fileName);

    showToast('✅ Dokumen PDF Formulir 14 berhasil didownload!', 'success');
  }

  // ==========================================
  // 3. Form Submit Handler
  // ==========================================
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const bidang = document.getElementById('bidang14')?.value;
      const namaPerwakilan = document.getElementById('namaPerwakilan')?.value.trim();
      const unitKerjaPerwakilan = document.getElementById('unitKerjaPerwakilan')?.value.trim();
      const telpPerwakilan = document.getElementById('telpPerwakilan')?.value.trim();

      const namaDiwakili = document.getElementById('namaDiwakili')?.value.trim();
      const unitKerjaDiwakili = document.getElementById('unitKerjaDiwakili')?.value.trim();
      const telpDiwakili = document.getElementById('telpDiwakili')?.value.trim();

      const jenisKegiatan = document.getElementById('jenisKegiatan14')?.value;
      const kota = document.getElementById('kota14')?.value.trim();
      const tanggal = document.getElementById('tanggal14')?.value;

      if (!bidang || !namaPerwakilan || !unitKerjaPerwakilan || !telpPerwakilan || !namaDiwakili || !unitKerjaDiwakili || !telpDiwakili || !kota || !tanggal) {
        showToast('Mohon lengkapi seluruh kolom wajib bertanda (*)', 'error');
        alert('Mohon lengkapi seluruh kolom wajib bertanda (*)');
        return;
      }

      // Check canvas signatures
      const blank = document.createElement('canvas');
      blank.width = 650;
      blank.height = 160;

      if (!sigState.canvas1.hasSigned || (canvas1 && canvas1.toDataURL() === blank.toDataURL())) {
        showToast('Mohon isi Tanda Tangan Yang Diwakili terlebih dahulu.', 'error');
        alert('Mohon isi Tanda Tangan Yang Diwakili terlebih dahulu.');
        return;
      }

      if (!sigState.canvas2.hasSigned || (canvas2 && canvas2.toDataURL() === blank.toDataURL())) {
        showToast('Mohon isi Tanda Tangan Yang Mewakili terlebih dahulu.', 'error');
        alert('Mohon isi Tanda Tangan Yang Mewakili terlebih dahulu.');
        return;
      }

      if (submitBtn) {
        submitBtn.innerHTML = '⏳ Sedang Mengirim Formulir...';
        submitBtn.disabled = true;
      }

      if (successMessage) successMessage.style.display = 'none';
      if (errorMessage) errorMessage.style.display = 'none';

      const randomId = 'F14-KKNI-' + Math.floor(1000 + Math.random() * 9000);
      const currentTime = new Date().toLocaleString('id-ID');
      const sigData1 = canvas1 ? canvas1.toDataURL('image/png') : '';
      const sigData2 = canvas2 ? canvas2.toDataURL('image/png') : '';

      const dataToSend = new URLSearchParams();
      dataToSend.append('formType', 'keterwakilan');
      dataToSend.append('form_type', 'form14');
      dataToSend.append('id', randomId);
      dataToSend.append('timestamp', currentTime);
      dataToSend.append('bidang', bidang);
      dataToSend.append('namaMewakili', namaPerwakilan);
      dataToSend.append('namaPerwakilan', namaPerwakilan);
      dataToSend.append('unitKerjaMewakili', unitKerjaPerwakilan);
      dataToSend.append('unitKerjaPerwakilan', unitKerjaPerwakilan);
      dataToSend.append('telpMewakili', telpPerwakilan);
      dataToSend.append('telpPerwakilan', telpPerwakilan);
      dataToSend.append('namaDiwakili', namaDiwakili);
      dataToSend.append('unitKerjaDiwakili', unitKerjaDiwakili);
      dataToSend.append('telpDiwakili', telpDiwakili);
      dataToSend.append('jenisKegiatan', jenisKegiatan || 'Konsensus');
      dataToSend.append('sekretaris', 'Eko Mardiono');
      dataToSend.append('telpSekretariat', '082169092497');
      dataToSend.append('fax', '-');
      dataToSend.append('kota', kota);
      dataToSend.append('tanggal', tanggal);
      dataToSend.append('signatureMewakili', sigData2);
      dataToSend.append('signaturePerwakilan', sigData2);
      dataToSend.append('signatureDiwakili', sigData1);

      // Backup local storage
      const localLog = {
        id: randomId,
        bidang,
        namaMewakili: namaPerwakilan,
        unitKerjaMewakili: unitKerjaPerwakilan,
        namaDiwakili,
        unitKerjaDiwakili,
        submittedAt: currentTime
      };
      const existingLogs = JSON.parse(localStorage.getItem('kkni_keterwakilan_f14_list') || '[]');
      existingLogs.push(localLog);
      localStorage.setItem('kkni_keterwakilan_f14_list', JSON.stringify(existingLogs));

      fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        body: dataToSend
      })
        .then(() => {
          if (successMessage) successMessage.style.display = 'block';
          if (errorMessage) errorMessage.style.display = 'none';
          finishSubmission(namaPerwakilan, namaDiwakili, bidang);
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

  function finishSubmission(namaMewakili, namaDiwakili, bidang) {
    if (form) {
      form.reset();
      form.style.display = 'none';
    }

    if (suksesBox) {
      const refMewakili = document.getElementById('refMewakili');
      const refDiwakili = document.getElementById('refDiwakili');
      const refBidang = document.getElementById('refBidang');

      if (refMewakili) refMewakili.innerText = namaMewakili;
      if (refDiwakili) refDiwakili.innerText = namaDiwakili;
      if (refBidang) refBidang.innerText = bidang;

      suksesBox.style.display = 'block';
    }
    showToast('✅ Formulir keterwakilan berhasil dikirim!', 'success');
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
