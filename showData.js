function showConfirm(message, onYes) {
  const modal = document.getElementById("confirmModal");
  const text  = modal.querySelector(".confirm-text");
  const yesBtn = document.getElementById("confirmYes");
  const noBtn  = document.getElementById("confirmNo");

  text.innerHTML = message;
  modal.style.display = "flex";

  function close() {
    modal.style.display = "none";
    document.removeEventListener("keydown", keyHandler);
  }

  function keyHandler(e) {
    if (e.key === "Enter") {
      yesBtn.click();
    }
    if (e.key === "Escape") {
      close();
    }
  }

  yesBtn.onclick = function () {
    close();
    onYes();
  };

  noBtn.onclick = close;

  document.addEventListener("keydown", keyHandler);
}

// create and save localStorage
let dataPro;
if(localStorage.product != null){
      dataPro = JSON.parse(localStorage.product)
} else {
      dataPro = [];
}
function addItemsList(btn, name, arabic, price, dosage_form) {

  let newPro = {
    name,
    arabic,
    price,
    dosage_form,
    added: true,
    quantam: 1,
    note: "",
    date: new Date().toLocaleDateString('en-GB')
  };

  let exists = dataPro.some(item => item.name === name);

  if (exists) {
    showToast("⚠️ هذا الصنف موجود في دفتر النواقص", "error");
    return;
  }

  // ✅ إضافة
  dataPro.push(newPro);
  localStorage.setItem('product', JSON.stringify(dataPro));
  showData();

  // ✅ تغيير شكل الزر فورًا
  btn.classList.add("added");
  btn.innerHTML = '<i class="fa fa-check"></i>';
  btn.disabled = true;

  // ✅ توست
  showToast("✅ تم إضافة الصنف بنجاح");
}



// read
function showData(){
  let table = '';

  for(let i = 0; i < dataPro.length; i++){
    table += `
<tr style="
 
  border-bottom:1px solid #ddd;
  font-size:13px;
  vertical-align:middle;
">

  <td class="index" style="
    text-align:center;
    border:1px solid #ccc;
    width:10px;
  ">
    ${i+1}
  </td>

  <td class="name" style="
    text-align:left;
    border:1px solid #ccc;
    font-weight:500;
  ">
    ${dataPro[i].name || '-'}
  </td>

  <td style="
    text-align:center;
    border:1px solid #ccc;
  ">
    ${dataPro[i].arabic || '-'}
  </td>

  <td class="price" style="
    text-align:center;
    border:1px solid #ccc;
    font-weight:bold;
  ">
    ${dataPro[i].price || 0}
  </td>

  <td style="display:none">
    ${dataPro[i].dosage_form || ''}
  </td>

  <td class="qty" onclick="addQ(${i})" title="اضغط لتعديل الكمية"
      style="
        text-align:center;
        border:1px solid #ccc;
        cursor:pointer;
        background:#f9f9f9;
        font-weight:bold;
      ">
    ${dataPro[i].quantam || 1}
  </td>

  <td style="display:none">
    ${dataPro[i].date || '_'}
  </td>

  <td class="note" onclick="addNote(${i})" title="اضغط لإضافة ملاحظات"
      style="
        border:1px solid #ccc;
        cursor:pointer;
        color:#555;
      ">
    ${dataPro[i].note || '—'}
  </td>

  <td class="actions no-print" style="
    text-align:center;
    border:1px solid #ccc;
    width:10px;
  ">
    <button onclick="deleteData(${i})"
      style="
        background:#dc3545;
        color:#fff;
        border:none;
        border-radius:4px;
        cursor:pointer;
      ">
      <i class="fa fa-trash"></i>
    </button>
  </td>

</tr>
`;

  }

  table += `
<tr class="add-row">
  <td colspan="9" style="
    text-align:center;
    border:1px dashed #aaa;
    background:#f8f9fa;
  ">
    <button onclick="addManualItem()"
      class="no-print"
      style="
       background: #d32f2f;
		color: #fff;
		border: none;
		padding: 6px 14px;
		border-radius: 4px;
		cursor: pointer;
      ">
      + إضافة صنف يدوي
    </button>
  </td>
</tr>
`;


  document.getElementById('tbody').innerHTML = table;
}

showData();


let deleteIndex = null;

function deleteData(i) {
  // جلب الاسم العربي للصنف المراد حذفه
  let itemArabicName = dataPro[i].arabic || dataPro[i].name;

  showConfirm(
    `<b style="color:red; font-size:16px;">${itemArabicName}</b><br><small>الحذف نهائي ولا يمكن التراجع</small>`,
    function () {
      dataPro.splice(i, 1);
      localStorage.setItem('product', JSON.stringify(dataPro));
      showData();
      showToast(`🗑️ تم حذف: ${itemArabicName}`, "success");
    }
  );
}


// تأكيد الحذف
document.getElementById("confirmYes").onclick = function () {
  if (deleteIndex !== null) {
    dataPro.splice(deleteIndex, 1);
    localStorage.product = JSON.stringify(dataPro);
    showData();
  }
  closeConfirm();
};

// إلغاء
document.getElementById("confirmNo").onclick = closeConfirm;

function closeConfirm(){
  document.getElementById("confirmModal").style.display = "none";
  deleteIndex = null;
}

// add Note
function addNote(index){
  openModal(
    '📝 أضف ملاحظة للصنف',
    dataPro[index].note,
    function(note){
      dataPro[index].note = note;
      localStorage.setItem('product', JSON.stringify(dataPro));
      showData();
      showToast('📝 تم حفظ الملاحظة');
    }
  );
}

// add quantam
function addQ(index){
  openModal(
    '🔢 تعديل الكمية',
    dataPro[index].quantam,
    function(qty){
      if(qty === '') qty = 1;
      dataPro[index].quantam = qty;
      localStorage.setItem('product', JSON.stringify(dataPro));
      showData();
      showToast('📦 تم تعديل الكمية');
    }
  );
}
let modalCallback = null;

function openModal(title, value, callback){
  modalCallback = callback;
  document.getElementById('modalTitle').innerText = title;
  document.getElementById('modalInput').value = value || '';
  document.getElementById('modalOverlay').style.display = 'flex';
  document.getElementById('modalInput').focus();
}

function closeModal(){
  document.getElementById('modalOverlay').style.display = 'none';
}

function confirmModal(){
  let val = document.getElementById('modalInput').value;
  if(modalCallback) modalCallback(val);
  closeModal();
}

// Enter = حفظ
document.addEventListener('keydown', e=>{
  if(e.key === 'Enter' && document.getElementById('modalOverlay').style.display === 'flex'){
    confirmModal();
  }
});

function addManualItem(){
  document.getElementById('addManualModal').style.display = 'flex';
}

function closeManual(){
  document.getElementById('addManualModal').style.display = 'none';
}

function saveManual(){
  let name = m_name.value.trim();
  let arabic = m_arabic.value.trim();
  let price = m_price.value.trim();

  // السماح بتجاهل الاسم
  if(name === '' && arabic !== '') name = arabic;
  if(arabic === '' && name !== '') arabic = name;

  // التحقق من أن الحقول ليست فارغة تماماً
  if(name === '' && arabic === '') {
      showToast('⚠️ يرجى إدخال اسم الصنف على الأقل', 'error');
      return;
  }

  dataPro.push({
    name: name,
    arabic: arabic,
    price: price || 0,
    quantam: 1,
    note: '',
    date: new Date().toLocaleDateString('en-GB')
  });

  // ✅ السطر الناقص الذي يحل المشكلة:
  localStorage.setItem('product', JSON.stringify(dataPro));

  closeManual();
  showData();

  // توست نجاح
  showToast('✅ تم إضافة الصنف بنجاح');

  // تفريغ الحقول بعد الحفظ
  m_name.value = '';
  m_arabic.value = '';
  m_price.value = '';
}






function editData(i) {

  let item = dataPro[i];



  let newArabic = prompt("عدل الاسم بالعربي:", item.arabic);

  if (!newArabic || newArabic.trim() === "") {

    alert("لا يمكن ترك الاسم العربي فارغًا");

    return;

  }



  let newName = prompt("عدل الاسم الإنجليزي (اختياري):", item.name) || "";

  let newPrice = prompt("عدل السعر (اختياري):", item.price) || "";

  let newDosage = prompt("عدل الشكل الدوائي (اختياري):", item.dosage_form) || "";



  // تحديث القيم

  dataPro[i].arabic = newArabic.trim();

  dataPro[i].name = newName.trim();

  dataPro[i].price = newPrice.trim();

  dataPro[i].dosage_form = newDosage.trim();



  // حفظ وتحديث الجدول

  localStorage.setItem('product', JSON.stringify(dataPro));

  showData();

}
function isItemAdded(name, arabic){
  return dataPro.some(item =>
    item.name === name && item.arabic === arabic
  );
}


let btnClass = isAdded ? 'add-btn added' : 'add-btn';
let btnIcon  = isAdded ? 'fa-check' : 'fa-plus';
let disabled = isAdded ? 'disabled' : '';
  // تغيير شكل الزر
  btn.classList.add('added');
  btn.innerHTML = '<i class="fa fa-check"></i>';
  btn.disabled = true;



