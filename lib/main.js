
$(document).ready(function() {

    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        // Device is ready
    }

    $(document).on('click', '#searchMode', function(event){
        $('.divSlidyInp').slideDown();
        event.stopPropagation();
    });

    $(document).on('click', '.spanSlidy', function(){
        searchMode.value = $(this).html();
        $('.divSlidyInp').slideUp();
        console.log("Search Mode Selected:", searchMode.value);
    });

    $(document).on('click','#XDelt', function(){
        $('#tableInfo').hide();
        $('#btn_print').show();
        $('#dafte').show();
        $('#inpSearch').val("");
        $('#resultDiv').html("");
		$('#box_price').hide();
    });

    $(document).on('click','.upperDiv', function(){
        $('#inpSearch').val("");
        $('#resultDiv').html("");
    });

    $(document).on('click', function () {
        $('.divSlidyInp').slideUp();
    });
	
$(document).on('keyup input', '#inpSearch, #minPrice, #maxPrice, #priceTypeSwitch', function() {
    $('#resultDiv').html("");
	
    // التمرير لأعلى منطقة البحث عند البدء في الكتابة
    if (this.id === 'inpSearch' && $(this).val().length > 0) {
        window.scrollTo({ top: $(this).offset().top - 10, behavior: 'smooth' });
    }

    const searchText = $('#inpSearch').val().trim();
    const minP = parseFloat($('#minPrice').val()) || 0;
    const maxP = parseFloat($('#maxPrice').val()) || Infinity;
    const isOldPrice = $('#priceTypeSwitch').is(':checked');

    // تحقق: هل مربع السعر مفتوح حالياً؟
    const isPriceFilterActive = $('#box_price').is(':visible');

    if (searchText.length < 1 && minP === 0 && maxP === Infinity) {
        $('#resultDiv').html("");
        $('#dafte').show();
        $('#tableInfo').hide();
        return;
    } else {
        $('#dafte').hide();
		$('#tableInfo').hide();
		
    }

    if (searchMode.value === "Advanced Search") {
        if (searchText.length < 3) {
            $('#resultDiv').html("");
            return;
        }
    }

    const [namePart, activePart] = searchText.split("=").map(part => part.trim());

    // --- أولاً: البحث بالتاريخ ---
    const fullDateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    const monthYearRegex = /^\d{1,2}\/\d{4}$/;

    
    // بناء الريجكس (يدعم الـ * كـ wildcard)
    const pattern = searchText.replace(/\*/g, ".*").replace(/\s+/g, ".*");
    const regexFromStart = new RegExp("^" + pattern, 'i'); // للبحث من البداية
    const regexAnywhere = new RegExp(pattern, 'i');      // للبحث في أي مكان

    if (fullDateRegex.test(searchText) || monthYearRegex.test(searchText)) {
        const dateParts = searchText.split('/');
        const day = dateParts.length === 3 ? parseInt(dateParts[0]) : null;
        const month = parseInt(dateParts[dateParts.length === 3 ? 1 : 0]);
        const year = parseInt(dateParts[dateParts.length - 1]);

        const filteredList = allDrugz.filter(drug => {
            if (!drug.Date_updated) return false;
            const drugDate = new Date(parseInt(drug.Date_updated));
            const matchesYear = drugDate.getFullYear() === year;
            const matchesMonth = (drugDate.getMonth() + 1) === month;
            const matchesDay = day ? drugDate.getDate() === day : true;

            // تطبيق فلتر السعر فقط إذا كان المربع مفتوحاً
            let matchesPrice = true;
            if (isPriceFilterActive) {
                const p = isOldPrice ? (parseFloat(drug.oldprice) || 0) : (parseFloat(drug.price) || 0);
                matchesPrice = (p >= minP && p <= maxP);
            }

            return matchesYear && matchesMonth && matchesDay && matchesPrice;
        })
        .sort((a, b) => b.Date_updated - a.Date_updated)
        .slice(0, 500);

        displayProcessedResults(filteredList);
        return;
    }

    // --- ثانياً: البحث المتقدم والعادي ---
    let finalFilteredList = [];

    if (searchMode.value === "Advanced Search" || searchMode.value === "Name-Active") {
        const namePattern = "^" + processText(namePart || "").replace(/\*/g, ".*").replace(/\s+/g, ".*");
        const activePattern = "^" + processText(activePart || "").replace(/\*/g, ".*").replace(/\s+/g, ".*");
        const nameRegex = new RegExp(namePattern, 'i');
        const activeRegex = new RegExp(activePattern, 'i');

        finalFilteredList = allDrugz.filter(drug => {
            const drugNameProcessed = processText(drug.name || "");
            const drugActiveProcessed = processText(drug.active || "");
            const matchesName = namePart ? nameRegex.test(drugNameProcessed) : true;
            const matchesActive = activePart ? activeRegex.test(drugActiveProcessed) : true;
            
            // فلتر السعر فقط إذا كان المربع مفتوحاً
            let matchesPrice = true;
            if (isPriceFilterActive) {
                const p = isOldPrice ? (parseFloat(drug.oldprice) || 0) : (parseFloat(drug.price) || 0);
                matchesPrice = (p >= minP && p <= maxP);
            }
            return matchesName && matchesActive && matchesPrice;
        });
    } 
  else {
        finalFilteredList = allDrugz.filter(drug => {
            let matchesText = false;

            if (searchMode.value === "المادة الفعالة") {
                // استخدام الريجكس للبحث في المادة الفعالة في أي مكان
                matchesText = regexAnywhere.test(drug.active || "");
            } 
            else if (searchMode.value === "الفارماكولوجي") {
                // استخدام الريجكس للبحث في الوصف
                matchesText = regexAnywhere.test(drug.description || "");
            } 
            else {
                // البحث العادي (أسم تجاري) من البداية فقط
                matchesText = regexFromStart.test(drug.name) || regexFromStart.test(drug.arabic);
            }

            // فلتر السعر
            let matchesPrice = true;
            if (isPriceFilterActive) {
                const p = isOldPrice ? (parseFloat(drug.oldprice) || 0) : (parseFloat(drug.price) || 0);
                matchesPrice = (p >= minP && p <= maxP);
            }
            return matchesText && matchesPrice;
        });
    }

    // الترتيب حسب السعر
    if (isPriceFilterActive) {
        finalFilteredList.sort((a, b) => {
            const pA = isOldPrice ? (parseFloat(a.oldprice) || 0) : (parseFloat(a.price) || 0);
            const pB = isOldPrice ? (parseFloat(b.oldprice) || 0) : (parseFloat(b.price) || 0);
            return pA - pB;
        });
    }

    // إرسال النص لعمل الـ Highlight
    displayProcessedResults(finalFilteredList.slice(0, 100), searchText);
});

function highlightText(text, term) {
    if (!term || !text) return text;
    // تنظيف النجوم من نص البحث لكي لا يكسر الريجكس
    const cleanTerm = term.replace(/\*/g, "").trim();
    if (!cleanTerm) return text;

    const regex = new RegExp(`(${cleanTerm})`, 'gi');
    return text.toString().replace(regex, '<mark style="background: #ffeb3b; padding: 0 2px; border-radius: 2px;">$1</mark>');
}

// دالة العرض المحدثة
function displayProcessedResults(list, searchTerm) {
    if (list.length === 0) {
        $('#resultDiv').html("<div style='text-align:center; padding:20px;'>No results found</div>");
    } else {
        list.forEach((drug, i) => {
            // عمل نسخة من البيانات لتجنب تعديل الأصل
            let displayedDrug = { ...drug };
            
            // تطبيق التلوين على الاسم والمادة والوصف
            displayedDrug.name = highlightText(displayedDrug.name, searchTerm);
            displayedDrug.arabic = highlightText(displayedDrug.arabic, searchTerm);
            displayedDrug.active = highlightText(displayedDrug.active, searchTerm);
            if(displayedDrug.description) {
                displayedDrug.description = highlightText(displayedDrug.description, searchTerm);
            }

            handelData(displayedDrug, i);
        });
    }
}

// دالة مساعدة لعرض النتائج لتقليل تكرار الكود
function displayProcessedResults(list) {
    if (list.length === 0) {
        $('#resultDiv').html("<div style='text-align:center; padding:20px;'>No results found</div>");
    } else {
        list.forEach((drug, i) => {
            handelData(drug, i);
        });
    }
}

// كود تشغيل زر فتح وإغلاق مربع السعر
// كود تشغيل زر السعر مع مسح الفلترة عند الإغلاق
$(document).on('click', '#btnTogglePrice', function() {
    const box = $('#box_price');
    
    box.slideToggle(300, function() {
        // إذا أصبح المربع مخفياً بعد الضغط
        if (box.is(':hidden')) {
            // 1. تصفير قيم المدخلات
            $('#minPrice').val("");
            $('#maxPrice').val("");
            $('#priceTypeSwitch').prop('checked', false);
            
            // 2. إطلاق حدث البحث لتحديث النتائج فوراً بدون فلاتر السعر
            $('#inpSearch').trigger('keyup');
        }
    });
});


// دالة لاستبدال الحروف العربية بحروف إنجليزية
function replaceArabicLetters(text) {
    return text
        .replace(/ب/g, "P")
        .replace(/ت/g, "T")
        .replace(/ث/g, "S")
        .replace(/ج/g, "G")
        .replace(/د/g, "D")
        .replace(/ذ/g, "Z")
        .replace(/ر/g, "R")
        .replace(/ز/g, "Z")
        .replace(/س/g, "S")
        .replace(/ش/g, "S")
        .replace(/ص/g, "S")
        .replace(/ض/g, "D")
        .replace(/ط/g, "T")
        .replace(/ظ/g, "Z")
        .replace(/ف/g, "F")
        .replace(/ق/g, "C")
        .replace(/ك/g, "K")
        .replace(/ل/g, "L")
        .replace(/م/g, "M")
        .replace(/ن/g, "N")
        .replace(/ه/g, "H")
		.replace(/ا/g, "")
        .replace(/و/g, "")
        .replace(/ؤ/g, "")
        .replace(/ي/g, "")
        .replace(/ى/g, "")
		.replace(/ئ/g, "")
		.replace(/ء/g, "")
		.replace(/أ/g, "")
		.replace(/ع/g, "")
        .replace(/غ/g, "")
        .replace(/ح/g, "")
        .replace(/خ/g, "")
		.replace(/\s+/g, "")
		.replace(/-/g, "")
}

// دالة استبدال الحروف الإنجليزية بعد تحويل النص من العربي
function processText(drugName) {
    return replaceArabicLetters(drugName.toUpperCase())
        .replace(/Z/g, "S")
        .replace(/CH/g, "K")
        .replace(/SH/g, "K")
        .replace(/PH/g, "F")
        .replace(/CCI/g, "XI")
        .replace(/CCY/g, "XI")
        .replace(/CCE/g, "XI")
        .replace(/CI/g, "SE")
        .replace(/CE/g, "SE")
        .replace(/CY/g, "SE")
        .replace(/C/g, "K")
        .replace(/SS/g, "S")
        .replace(/SZ/g, "S")
        .replace(/CC/g, "K")
        .replace(/CK/g, "K")
        .replace(/P/g, "B")
        .replace(/Q/g, "K")
        .replace(/KS/g, "X")
        .replace(/RH/g, "R")
        .replace(/V/g, "F")
        .replace(/TH/g, "S")
        .replace(/MM/g, "M")
        .replace(/LL/g, "L")
        .replace(/NN/g, "N")
        .replace(/J/g, "G")
        .replace(/GG/g, "G")
		.replace(/\s+/g, "")
		.replace(/-/g, "")
        .replace(/E/g, "")
        .replace(/A/g, "")
        .replace(/I/g, "")
        .replace(/Y/g, "")
        .replace(/U/g, "")
        .replace(/O/g, "")
}

function getImageByName(drugName) {
    let foundImage = imageDrug.find(img => img.name === drugName);
    if (foundImage && foundImage.img) {
        return "images/" + foundImage.img;
    }

}

function formatDate(timestamp) {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// دالة تعديل السعر
function editPrice(drugName, index) {
    // الحصول على السعر الحالي من العنصر
    let currentPrice = $(`#price-${index}`).text();
    
    // نافذة prompt لتعديل السعر
    let newPrice = prompt(`تعديل سعر ${drugName}`, currentPrice);
    
    if (newPrice !== null && newPrice.trim() !== "") {
        // تحديث السعر في الواجهة
        $(`#price-${index}`).text(parseFloat(newPrice).toFixed(2));
        
        // تحديث السعر في قاعدة البيانات (allDrugz)
        for (let j = 0; j < allDrugz.length; j++) {
            if (allDrugz[j].name === drugName) {
                // حفظ السعر القديم قبل التحديث
                allDrugz[j].oldprice = allDrugz[j].price;
                // تحديث السعر الجديد
                allDrugz[j].price = newPrice;
                // تحديث تاريخ التعديل
                allDrugz[j].Date_updated = Date.now().toString();
                
                // حفظ في localStorage إذا كنت تستخدمه
                localStorage.setItem('drugsData', JSON.stringify(allDrugz));
                
                showToast(`✅ تم تعديل سعر ${drugName} بنجاح`, "success");
                break;
            }
        }
    }
}
// ✅ هذا السطر مهم جداً لجعل الدالة معرفة عالمياً
window.editPrice = editPrice;
// تحميل قاعدة البيانات عند تحميل الصفحة
function handelData(drug, i) {
    var {
        name,
        arabic,
        active,
        price,
        oldprice = "N/A",
        units: unite,
        dosage_form: dosageForm = "default",
        description,
        details,
        barcode,
        company,
        route,
        Date_updated
    } = drug;

    // 1. استخراج دواعي الاستعمال والأمان
    let indicationText = "لم يتم تحديد دواعي الاستعمال";
    let safetyHTML = ""; 

    if (typeof indicationsDB !== 'undefined') {
        const fullActiveKey = active.toLowerCase().trim();
        const firstActiveKey = active.split('+')[0].toLowerCase().trim();
        
        const entry = indicationsDB[fullActiveKey] || indicationsDB[firstActiveKey];
        
        if (entry) {
            // جلب النص (دعم للنظام القديم كـ String أو الجديد كـ Object)
            indicationText = (typeof entry === 'string') 
                ? entry 
                : (entry.usage ? (entry.usage[dosageForm.toLowerCase()] || entry.usage["default"] || "دواعي استعمال عامة") : (entry[dosageForm.toLowerCase()] || entry["default"]));

            // منطق تحديد أدوية الأطفال لمنع ظهور فئة الحمل لهم
            const formLower = dosageForm.toLowerCase();
            // تحديث منطق التعرف على أدوية الأطفال ليشمل الـ Powder (المعد للحل كشراب)
            // 1. تحديد ما إذا كان الشكل الصيدلاني هو "قطرة" بشكل عام
            const isAnyDrop = formLower.includes('drops');

            // 2. استثناء قطرات (العين/الأذن/الأنف) من تصنيف الأطفال التلقائي
            const isEyeOrEarDrop = formLower.includes('eye') || 
                                   formLower.includes('ear') || 
                                   formLower.includes('nasal') ||
                                   formLower.includes('ophthalmic');

            // 3. تحديث منطق أدوية الأطفال
            const isPediatric = formLower.includes('suspension') || 
                               formLower.includes('syrup') || 
                               formLower.includes('powder') || 
                               formLower.includes('supp') ||
                               (isAnyDrop && !isEyeOrEarDrop) || // لو نقط مش للعين/الأذن/الأنف (زي نقط الفم للأطفال)
                               name.toLowerCase().includes('infant') || 
                               name.toLowerCase().includes('ped');

            // إضافة دائرة الألوان لفئة الحمل إذا لم يكن دواء أطفال
            if (entry.safety && !isPediatric) {
                let category = entry.safety.preg || "?";
                let bgColor = "#808080"; // رمادي افتراضي
                
                if (category === "A") bgColor = "#2e7d32";      // أخضر غامق
                else if (category === "B") bgColor = "#4caf50"; // أخضر فاتح
                else if (category === "C") bgColor = "#fbc02d"; // أصفر
                else if (category === "D") bgColor = "#f57c00"; // برتقالي
                else if (category === "X") bgColor = "#d32f2f"; // أحمر
                
                safetyHTML = `
                    <div style="display: inline-flex; align-items: center; gap: 5px; background: white; padding: 2px 8px; border-radius: 20px; border: 1px solid ${bgColor}; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-right: auto;">
                        <b style="color: ${bgColor}; font-size: 11px; white-space: nowrap;">فئة الحمل: ${category} 🤰</b>
                        <span style="width: 8px; height: 8px; background-color: ${bgColor}; border-radius: 50%;"></span>
                    </div>`;
            }
        }
    }

    var avalebyl = "";
    if(name.includes("n/a")){
        avalebyl = "هذا الصنف غير متاح";
    } else if(name.includes("(cancelled)")){
        avalebyl = "هذا الدواء تم إلغاؤه";
    }

    var unitePrice = price / unite;
    var imageUrl = getImageByName(name) || getImageByRoute(route);
    var lastUpdated = Date_updated ? formatDate(Date_updated) : "غير متاح";

    let added = isItemAdded(name, arabic);
    let btnClass = added ? 'add-btn added' : 'add-btn';
    let btnIcon  = added ? 'fa-check' : 'fa-plus';
    let disabled = added ? 'disabled' : '';

    // توليد الكارد النهائي مع زر التعديل
    $('#resultDiv').append(`
        <div class="outerDvFlx drugCard" style="display: flex; flex-direction: column; padding: 10px; border-bottom: 1px solid #ddd; background:#fff; border-radius:8px; margin:8px auto; box-shadow:0 0 6px 1px rgb(0 0 0 / 15%);">
            
            <div style="display: flex; flex-direction: row; align-items: center; width: 100%; justify-content: space-between; flex-wrap: nowrap;">
                
                <div style="width: 65px; height: 65px; flex-shrink: 0; border: 1px solid #ccc; border-radius: 5px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #fff;">
                    <img src="${imageUrl}" alt="صورة الدواء" style="max-width: 100%; max-height: 100%; object-fit: cover;">
                </div>

                <div style="flex-grow: 1; padding: 0 10px; min-width: 0;">
                    <div class="nameTD" style="text-align: left !important; display: flex; flex-direction: column; align-items: flex-start;">
                        <span style="font-size: 16px; font-weight: bold; color: #333; line-height: 1.2;">${name}</span>
                        <span style="font-size: 12px; color: gray; direction: rtl; align-self: flex-start;">${arabic}</span>
                        <span style="font-size: 14px; color: blue; line-height: 1.2;">🧪 ${active}</span> 
                        <span style="font-size: 12px; color: green;">📂 ${description || 'غير مصنف'}</span>
                        <span style="font-size: 12px; color: darkblue;">Units: ${unite} <span style="color:red">(unit: ${unitePrice.toFixed(1)} L.E)</span></span>
                        <span style="font-size: 13px; color: red; font-weight: bold;">${avalebyl}</span>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; min-width: 95px;">
                    <div style="width: 90px; padding: 6px; text-align: center; border: 2px solid #ff4d4d; border-radius: 8px; background-color: #fff3f3;">
                        <span style="font-size:9px; color:purple;">${lastUpdated}</span><br>
                        <span style="color:#d60000; font-size: 17px; font-weight: bold;" id="price-${i}">${parseFloat(price).toFixed(2)}</span><br>
                        <span style="font-size: 9px; color:gray"><del>${oldprice} L.E</del></span>
                    </div>
                </div>
            </div>

            <div style="margin-top:8px; display: flex; align-items: center; justify-content: space-between; background:#eafaea; padding:8px; border-radius:5px; color:#2d8a2d; border-right: 4px solid #2d8a2d; direction: rtl; text-align: right;">
                
                <div style="display: flex; align-items: center; gap: 5px; flex-wrap: wrap;">
                    <b style="white-space: nowrap; font-size:12px"> دواعي الاستعمال:</b>
                    <span style="unicode-bidi: embed; font-size: 12px;">${indicationText} 💡</span>
                </div>

                <div style="margin-right: 15px;">
                    ${safetyHTML}
                </div>
                
            </div>

            <div class="buttons-container" style="display: flex; flex-wrap: wrap; width: 100%; margin-top: 10px; gap: 6px;">
                
                <button onclick="getSimilar('${active}')" 
                        class="btn btn-success metaBtnn" 
                        style="flex-grow: 1; flex-basis: 80px; margin: 0; font-size: 12px; padding: 8px 5px; border-radius: 6px;">
                        Similars 👌
                </button>
                
                <button onclick="getAlt('${description}', '${active}')" 
                        class="btn btn-primary metaBtnn" 
                        style="flex-grow: 1; flex-basis: 80px; margin: 0; font-size: 12px; padding: 8px 5px; border-radius: 6px;">
                        Alts 💊
                </button>
                
                <button onclick="moreInfo('${name}', '${arabic}', '${active}', '${price}', '${oldprice}', '${description}', '${dosageForm}', '${details}', '${barcode}', '${company}', '${unite}', '${unitePrice}', '${route}', '${imageUrl}', '${indicationText}')" 
                       class="btn btn-danger metaBtnn"
                        style="box-shadow: 0 4px 10px rgba(87, 87, 177, 0.4); flex-grow: 1; flex-basis: 80px; margin: 0; font-size: 12px; padding: 8px 5px; border-radius: 6px;">
                        More.. 🕵
                </button>

         

                <button class="${btnClass}" ${disabled} onclick="addItemsList(this,'${name}','${arabic}','${price}','${dosageForm}')">
                    <i class="fa ${btnIcon}"></i>
                </button>
            </div>
        </div>
    `);
}

function getImageByRoute(route, dosageForm) {
    if (!route) return "img/logo.png";

    route = route.toLowerCase();
    const form = dosageForm ? dosageForm.toLowerCase() : "";

    // 1. فحص الأكياس والفوار أولاً (Sachets & Effervescent)
    if (form.includes("sachet") || route.includes("sachet")) return "img/sachets.png";
    if (form.includes("eff") || route.includes("eff")) return "img/eff.png";
    
    // 2. الحقن والمحاليل (Injection & Infusion)
    if (route.includes("infusion")) return "img/infusion.png";
    if (route.includes("injection") || route.includes("inj")) return "img/injction.png";

    // 3. القطرات (Drops) - ترتيب ذكي
    if (route.includes("dropeye") || (route.includes("eye") && route.includes("drop"))) return "img/dropeye.png";
    if (route.includes("drop")) return "img/drop.png"; // قطرة عامة

    // 4. الجهاز التنفسي والأنف
    if (route.includes("inhal")) return "img/inhalation.png";
    if (route.includes("nasal") || route.includes("nose")) return "img/nasal.png";
    if (route.includes("spray")) return "img/spray.png";

    // 5. المسارات الشائعة الأخرى
    if (route.includes("oral.solid")) return "img/oralsolid.png";
    if (route.includes("oral.liquid")) return "img/oralliquid.png";
    if (route.includes("topical")) return "img/topical.png";
    if (route.includes("rectal")) return "img/rectal.png";
    if (route.includes("vaginal")) return "img/vaginal.png";
    
    // 6. حالات خاصة من القائمة
    if (route.includes("eye")) return "img/eye.png";
    if (route.includes("ear")) return "img/ear.png";
    if (route.includes("mouth")) return "img/mouth.png";
    if (form.includes("soap") || route.includes("soap")) return "img/soap.png";
    if (form.includes("powder") || route.includes("powder")) return "img/powder.png";

    // افتراضي إذا لم يتطابق شيء
    return "img/logo.png";
}


// دالة لعرض الصورة بحجم أكبر
function showLargeImage(imageUrl) {
    var imgModal = document.getElementById('imageModal');
    var imgElement = document.getElementById('modalImage');
    imgElement.src = imageUrl;
    imgModal.style.display = "block";
	
}

// دالة لإغلاق الصورة عند الضغط خارجها
function closeModal() {
    document.getElementById('imageModal').style.display = "none";
	
}
/* ================== CONFIG & VARIABLES ================== */
/* ================== 1. CONFIG & GLOBAL VARIABLES ================== */
const dosageFormIcons = {
    // الأشكال الفموية
    tablet: { icon: "💊", label: "أقراص" },
    capsule: { icon: "💊", label: "كبسولات" },
    syrup: { icon: "🥤", label: "شراب" },
    suspension: { icon: "🥄", label: "معلق" },
    sachet: { icon: "🧪", label: "أكياس" }, 
    piece: { icon: "🍬", label: "قطع مضغ/حلاوة" },

    // السوائل والنقط
    drops: { icon: "💧", label: "نقط" },
    "oral drops": { icon: "🍼", label: "نقط فموية" }, // تم وضع تنصيص هنا
    "eye drops": { icon: "👁️", label: "قطرة عين" }, // تم وضع تنصيص هنا
    "ear drops": { icon: "👂", label: "قطرة أذن" }, // تم وضع تنصيص هنا
    nasal: { icon: "👃", label: "بخاخ أنف" },
    solution: { icon: "🧪", label: "محلول" },
    "mouth wash": { icon: "👄", label: "غرغرة/مضمضة" }, // تم وضع تنصيص هنا

    // الحقن
    injection: { icon: "💉", label: "حقن" },
    vial: { icon: "🧪", label: "فيال (بودرة/سائل)" },
    ampoule: { icon: "🧪", label: "أمبول" },
    syringe: { icon: "💉", label: "سرنجة جاهزة" }, 
    infusion: { icon: "🏥", label: "محلول وريدي" },
    bottle: { icon: "🍼", label: "زجاجة" },

    // الأشكال الموضعية (كريمات ودهانات)
    cream: { icon: "🧴", label: "كريم" },
    ointment: { icon: "🧴", label: "مرهم" },
    gel: { icon: "🧴", label: "جل" },
    lotion: { icon: "🧴", label: "لوشن" },
    spray: { icon: "🌬️", label: "بخاخ موضعي" },
    scrub: { icon: "🧼", label: "منظف رغوي" }, 
    shampoo: { icon: "🧼", label: "شامبو طبي" },
    patch: { icon: "🩹", label: "لاصق طبي" },

    // التنفسي
    inhaler: { icon: "😮‍💨", label: "استنشاق/بخاخة" },
    respules: { icon: "🌬️", label: "محلول نيبولايزر" },

    // أخرى
    suppository: { icon: "🔻", label: "لبوس" },
    vaginal: { icon: "🥚", label: "لبوس مهبلي" },
    powder: { icon: "🧂", label: "بودرة" },
    enema: { icon: "🧴", label: "حقنة شرجية" }
};

window.fullList = []; 
window.currentList = [];
window.sortPriceAsc = true;
window.sortNameAsc = true;
window.currentCompany = "all";
window.currentFilterForm = "all";
window.currentStrength = "all";
/* ================== 1. FILL COMPANY FILTER ================== */
window.fillCompanyFilter = function(list) {
    const select = document.getElementById("companyFilter");
    if (!select) return;
    
    select.innerHTML = `<option value="all">🏭 الشركات (${list.length})</option>`;

    const multi = ["novartis", "gsk", "sanofi", "pfizer", "astrazeneca", "roche", "bayer", "servier"];
    const bigL = ["amoun", "epico", "pharaonia", "sedico", "eva", "global nabi", "hikma"];

    const companyMap = new Map();
    list.forEach(d => {
        if (d.company) {
            const k = d.company.trim().toLowerCase();
            companyMap.set(k, { name: d.company.trim(), count: (companyMap.get(k)?.count || 0) + 1 });
        }
    });

    const groups = { 
        "group:multi": { label: "🌍 دولية", items: [] }, 
        "group:local": { label: "🏢 كبرى", items: [] }, 
        "group:other": { label: "🏭 أخرى", items: [] } 
    };

    [...companyMap.entries()].sort().forEach(([key, data]) => {
        if (multi.some(m => key.includes(m))) groups["group:multi"].items.push(data);
        else if (bigL.some(l => key.includes(l))) groups["group:local"].items.push(data);
        else groups["group:other"].items.push(data);
    });

    Object.keys(groups).forEach(id => {
        const g = groups[id];
        if (g.items.length > 0) {
            select.innerHTML += `<option value="${id}" ${window.currentCompany === id ? 'selected' : ''} style="background:#d1e7dd; font-weight:bold;">🔎 كل: ${g.label}</option>`;
            let gh = `<optgroup label="── ${g.label} ──">`;
            g.items.forEach(item => {
                gh += `<option value="${item.name.toLowerCase()}" ${window.currentCompany === item.name.toLowerCase() ? 'selected' : ''}>${item.name} [${item.count}]</option>`;
            });
            select.innerHTML += gh + `</optgroup>`;
        }
    });
};

/* ================== 2. FILL STRENGTH FILTER ================== */
window.fillStrengthFilter = function(list) {
    const select = document.getElementById("strengthFilter");
    if (!select) return;
    
    select.innerHTML = `<option value="all">⚗️ كل التركيزات (${list.length})</option>`;
    
    const finalMap = {};
    const groupsConfig = {
        "solid": { label: "💊 صلب", forms: ["tablet", "capsule", "pill", "sachet", "powder"] },
        "liquid": { label: "🥤 سائل", forms: ["syrup", "suspension", "drops"] },
        "injectable": { label: "💉 حقن", forms: ["injection", "vial", "ampoule", "infusion"] },
        "topical": { label: "🧴 موضعي", forms: ["cream", "ointment", "gel", "lotion", "paint"] },
        "other": { label: "📦 أخرى", forms: [] }
    };

list.forEach(d => {
        let str = extractStrength(d); // استخراج التركيز باستخدام الدالة المطورة
        if(!str) return; 

        // توحيد شكل النص (إزالة النقاط الزائدة في الوحدات لضمان التجميع الصحيح)
        str = str.replace(/i\.u/g, "iu").toLowerCase();

        const form = (d.dosage_form || "غير محدد").toLowerCase();
        let tg = "other";
        
        // تحديد المجموعة (صلب، سائل، إلخ)
        for (const [k, c] of Object.entries(groupsConfig)) { 
            if (c.forms.some(f => form.includes(f))) { 
                tg = k; 
                break; 
            } 
        }

        if(!finalMap[tg]) finalMap[tg] = new Map();
        
        // المفتاح الذي سيظهر في القائمة المنسدلة
        const key = `${str} – ${d.dosage_form}`;
        
        // تصحيح عداد العناصر داخل الـ Map
        const currentCount = finalMap[tg].get(key) || 0;
        finalMap[tg].set(key, currentCount + 1);
    });

    // رسم القائمة المنسدلة
    Object.keys(groupsConfig).forEach(groupId => {
        const groupItems = finalMap[groupId];
        if (groupItems && groupItems.size > 0) {
            let groupHtml = `<optgroup label="── ${groupsConfig[groupId].label} ──">`;
            [...groupItems.entries()]
                .sort((a,b) => a[0].localeCompare(b[0], undefined, {numeric:true}))
                .forEach(([k, c]) => {
                    groupHtml += `<option value="${k}">${k} [${c}]</option>`;
                });
            select.innerHTML += groupHtml + `</optgroup>`;
        }
    });
};
/* ================== 3. RENDER SORT BAR (تعديل بسيط لاستدعاء الدوال) ================== */
window.renderSortButtons = function() {
    // ... نفس كود renderSortButtons السابق ...
    // تأكد فقط أن السطرين الأخيرين هما:
    window.fillCompanyFilter(window.fullList);
    window.fillStrengthFilter(window.fullList);
};
/* ================== 2. HANDEL DATA (YOUR FUNCTION) ================== */
window.handelData = function(drug, i) {
    var {
        name, arabic, active, price, oldprice = "N/A", units: unite,
        dosage_form: dosageForm = "default", description, details,
        barcode, company, route, Date_updated
    } = drug;

    var avalebyl = "";
    if(name.includes("n/a")) avalebyl = "هذا الصنف غير متاح";
    else if(name.includes("(cancelled)")) avalebyl = "هذا الدواء تم إلغاؤه";

    var unitePrice = price / unite;
    var imageUrl = (typeof getImageByName === 'function') ? (getImageByName(name) || getImageByRoute(route)) : "";
    var lastUpdated = Date_updated ? (typeof formatDate === 'function' ? formatDate(Date_updated) : Date_updated) : "غير متاح";
    
    // --- جلب دواعي الاستعمال والأمان بذكاء ---
    let indicationText = "لم يتم تحديد دواعي الاستعمال";
    let safetyHTML = ""; // متغير لإضافة مربع ألوان الحمل

    if (typeof indicationsDB !== 'undefined') {
        const fullActiveKey = active.toLowerCase().trim(); 
        const firstActiveKey = active.split('+')[0].toLowerCase().trim(); 
        
        const entry = indicationsDB[fullActiveKey] || indicationsDB[firstActiveKey];
        
        if (entry) {
            // جلب دواعي الاستعمال
            indicationText = (typeof entry === 'string') ? entry : (entry.usage ? (entry.usage[dosageForm.toLowerCase()] || entry.usage["default"] || "دواعي استعمال عامة") : (entry[dosageForm.toLowerCase()] || entry["default"] || "دواعي استعمال عامة"));

            // منطق تحديد أدوية الأطفال لمنع ظهور فئة الحمل لهم
          // 1. تحويل الشكل الصيدلاني لنص صغير للفحص
const formLower = dosageForm.toLowerCase();

// 2. التحقق مما إذا كانت القطرة موجهة للعين أو الأذن أو الأنف (هذه ليست أدوية أطفال بالضرورة)
// تحديد إذا كانت قطرة موضعية (عين/أذن/أنف)
            const isTopicalDrop = formLower.includes('eye') || 
                                  formLower.includes('ear') || 
                                  formLower.includes('nasal') || 
                                  formLower.includes('ophthalmic') ||
                                  formLower.includes('otic');

// 3. تعديل منطق أدوية الأطفال (الاستثناء)
const isPediatric = formLower.includes('suspension') || 
                               formLower.includes('syrup') || 
                               formLower.includes('supp') ||
                               (formLower.includes('drops') && !isTopicalDrop) || 
                               name.toLowerCase().includes('infant') || 
                               name.toLowerCase().includes('ped');
				   
            // إضافة نظام ألوان فئة الحمل (Pregnancy Category)
            if (entry.safety && !isPediatric) {
                let category = entry.safety.preg || "?";
                let bgColor = "#808080";
                
				if (category === "A") bgColor = "#2e7d32";      
                else if (category === "B") bgColor = "#4caf50"; 
                else if (category === "C") bgColor = "#fbc02d"; 
                else if (category === "D") bgColor = "#f57c00"; 
                else if (category === "X") bgColor = "#d32f2f";

  safetyHTML = `
    <div style="display: inline-flex; align-items: center; gap: 5px; background: white; padding: 2px 8px; border-radius: 20px; border: 1px solid ${bgColor}; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-right: auto;">
        <b style="color: ${bgColor}; font-size: 11px; white-space: nowrap;">فئة الحمل: ${category} 🤰</b>
        <span style="width: 8px; height: 8px; background-color: ${bgColor}; border-radius: 50%;"></span>
    </div>`;
            }
        }
    }

    let added = (typeof isItemAdded === 'function') ? isItemAdded(name, arabic) : false;
    let btnClass = added ? 'add-btn added' : 'add-btn';
    let btnIcon  = added ? 'fa-check' : 'fa-plus';
    let disabled = added ? 'disabled' : '';

    $('#resultDiv').append(`
        <div class="outerDvFlx drugCard" style="display: flex; flex-direction: column; padding: 10px; border-bottom: 1px solid #ddd; background:#fff; border-radius:8px; margin:8px auto; box-shadow:0 0 6px 1px rgb(0 0 0 / 15%);">
            <div style="display: flex; flex-direction: row; align-items: center; width: 100%; justify-content: space-between; flex-wrap: nowrap;">
                
                <div style="width: 65px; height: 65px; flex-shrink: 0; border: 1px solid #ccc; border-radius: 5px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #fff;">
                    <img src="${imageUrl}" alt="صورة الدواء" style="max-width: 100%; max-height: 100%; object-fit: cover;">
                </div>

                <div style="flex-grow: 1; padding: 0 10px; min-width: 0;">
                    <div class="nameTD" style="text-align: left !important; display: flex; flex-direction: column; align-items: flex-start;">
                        <span style="font-size: 16px; font-weight: bold; color: #333; line-height: 1.2;">${name}</span>
                        <span style="font-size: 12px; color: gray; direction: rtl; align-self: flex-start;">${arabic}</span>
                        <span style="font-size: 14px; color: blue; line-height: 1.2;">🧪 ${active}</span> 
                        <span style="font-size: 12px; color: green;">📂 ${description || 'غير مصنف'}</span>
                        <span style="font-size: 12px; color: darkblue;">Units: ${unite} <span style="color:red">(unit: ${unitePrice.toFixed(1)} L.E)</span></span>
                        <span style="font-size: 13px; color: red; font-weight: bold;">${avalebyl}</span>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; min-width: 95px;">
                    <div style="width: 90px; padding: 6px; text-align: center; border: 2px solid #ff4d4d; border-radius: 8px; background-color: #fff3f3;">
                        <span style="font-size:9px; color:purple;">${lastUpdated}</span><br>
                        <span style="color:#d60000; font-size: 17px; font-weight: bold;">${parseFloat(price).toFixed(2)}</span><br>
                        <span style="font-size: 9px; color:gray"><del>${oldprice} L.E</del></span>
                    </div>
                </div>
            </div>
            
<div style="margin-top:8px; display: flex; align-items: center; justify-content: space-between; background:#eafaea; padding:8px; border-radius:5px; color:#2d8a2d; border-right: 4px solid #2d8a2d; direction: rtl; text-align: right;">
    
    <div style="display: flex; align-items: center; gap: 5px; flex-wrap: wrap;">
        <b style="white-space: nowrap; font-size:12px"> دواعي الاستعمال:</b>
        <span style="unicode-bidi: embed; font-size: 12px;">${indicationText} 💡</span>
    </div>

    <div style="margin-right: 15px;">
        ${safetyHTML}
    </div>
    
</div>

            <div class="buttons-container" style="display: flex; flex-wrap: wrap; width: 100%; margin-top: 10px; gap: 6px;">
                <button onclick="getSimilar('${active}')" class="btn btn-success metaBtnn" style="flex-grow: 1; flex-basis: 100px; margin: 0; font-size: 13px; padding: 8px 5px; border-radius: 6px;">Similars 👌</button>
                <button onclick="getAlt('${description}', '${active}')" class="btn btn-primary metaBtnn" style="flex-grow: 1; flex-basis: 100px; margin: 0; font-size: 13px; padding: 8px 5px; border-radius: 6px;">Alts 💊</button>
                <button onclick="moreInfo('${name}', '${arabic}', '${active}', '${price}', '${oldprice}', '${description}', '${dosageForm}', '${details}', '${barcode}', '${company}', '${unite}', '${unitePrice}', '${route}', '${imageUrl}', '${indicationText}')" class="btn btn-danger metaBtnn" style="flex-grow: 1; flex-basis: 100px; margin: 0; font-size: 13px; padding: 8px 5px; border-radius: 6px;">More.. 🕵</button>
                <button class="${btnClass}" ${disabled} onclick="addItemsList(this,'${name}','${arabic}','${price}','${dosageForm}')"><i class="fa ${btnIcon}"></i></button>
            </div>
        </div>
    `);
};
/* ================== 3. CORE LOGIC (REDRAW & FILTER) ================== */
window.redrawList = function() {
    if ($('#sortBar').length === 0) window.renderSortButtons();
    $('#resultDiv .drugCard').remove();
    $('#resultDiv .no-results').remove();

    if (window.currentList.length === 0) {
        $('#resultDiv').append('<p class="no-results" style="text-align:center; padding:20px; width:100%;">عذراً، لا توجد نتائج تطابق بحثك.</p>');
    } else {
        window.currentList.forEach((drug, i) => window.handelData(drug, i));
    }
};

window.applyFilters = function() {
    window.currentList = window.fullList.filter(d => {
        const company = (d.company || "").trim().toLowerCase();
        const form = (d.dosage_form || "").trim().toLowerCase();
        const strength = extractStrength(d);

        let matchForm = (window.currentFilterForm === "all") || 
            (window.currentFilterForm.startsWith("group:") && checkGroupMatch(window.currentFilterForm.split(":")[1], form)) ||
            (form === window.currentFilterForm);

        let matchComp = (window.currentCompany === "all") || 
            (window.currentCompany.startsWith("group:") && checkCompanyGroupMatch(window.currentCompany.split(":")[1], company)) ||
            (company === window.currentCompany);

        let matchStr = (window.currentStrength === "all");
        if (!matchStr) {
            const [selS, selF] = window.currentStrength.split(" – ").map(s => s.trim().toLowerCase());
            matchStr = (strength === selS && form === selF);
        }
        return matchForm && matchComp && matchStr;
    });
    window.redrawList();
};

function checkGroupMatch(gk, form) {
    const gConf = {
        "solid": ["tablet", "capsule", "pill", "sachet", "powder"],
        "liquid": ["syrup", "suspension", "drops", "solution"],
        "injectable": ["injection", "vial", "ampoule", "infusion"],
        "topical": ["cream", "ointment", "gel", "lotion", "paint", "solution"],
        "supp": ["suppository", "pessary"],
        "respiratory": ["spray", "inhaler", "nasal"]
    };
    return gConf[gk]?.includes(form);
}

function checkCompanyGroupMatch(type, company) {
    const multi = ["novartis", "gsk", "sanofi", "pfizer", "astrazeneca", "roche", "bayer", "servier"];
    const bigL = ["amoun", "epico", "pharaonia", "sedico", "eva", "global nabi", "hikma"];
    if (type === "multi") return multi.some(m => company.includes(m));
    if (type === "local") return bigL.some(l => company.includes(l));
    return !multi.some(m => company.includes(m)) && !bigL.some(l => company.includes(l));
}

/* ================== 4. UI RENDER (SORT BAR) ================== */
window.renderSortButtons = function() {
    const groupsConfig = {
        "solid": { label: "أصناف صلبة", icon: "💊", forms: ["tablet", "capsule", "pill", "sachet", "powder"] },
        "liquid": { label: "أشربة ونقط", icon: "🥤", forms: ["syrup", "suspension", "drops", "solution"] },
        "injectable": { label: "حقن وأمبولات", icon: "💉", forms: ["injection", "vial", "ampoule", "infusion"] },
        "topical": { label: "موضعي", icon: "🧴", forms: ["cream", "ointment", "gel", "lotion", "paint"] },
        "supp": { label: "لبوس", icon: "🔻", forms: ["suppository", "pessary"] },
        "other": { label: "أخرى", icon: "📦", forms: [] }
    };

    const formMap = new Map();
    window.fullList.forEach(d => { if (d.dosage_form) { const f = d.dosage_form.toLowerCase().trim(); formMap.set(f, (formMap.get(f) || 0) + 1); } });

    let formOptions = `<option value="all" ${window.currentFilterForm === 'all' ? 'selected' : ''}>📦 الأشكال (${window.fullList.length})</option>`;
    Object.keys(groupsConfig).forEach(groupId => {
        const config = groupsConfig[groupId];
        let itemsHtml = ""; let gTotal = 0;
        formMap.forEach((count, form) => {
            const isMatch = (groupId === "other") ? !Object.values(groupsConfig).some(g => g.forms.includes(form)) : config.forms.includes(form);
            if (isMatch) {
                const icon = dosageFormIcons[form] || { icon: config.icon, label: form };
                itemsHtml += `<option value="${form}" ${window.currentFilterForm === form ? 'selected' : ''}>${icon.icon} ${icon.label} [${count}]</option>`;
                gTotal += count;
            }
        });
        if (gTotal > 0) {
            formOptions += `<option value="group:${groupId}" ${window.currentFilterForm === 'group:'+groupId ? 'selected' : ''} style="background:#e3f2fd; font-weight:bold;">🔎 كل: ${config.label} [${gTotal}]</option>`;
            formOptions += `<optgroup label="──────────">${itemsHtml}</optgroup>`;
        }
    });

    if($('#sortBar').length === 0) {
        $('#resultDiv').prepend(`<div id="sortBar" style="display:flex; gap:8px; margin-bottom:15px; flex-wrap:wrap; padding:10px; background:#fcfcfc; border-bottom:1px solid #ddd; position:sticky; top:0; z-index:1000;"></div>`);
    }

    $('#sortBar').html(`
        <button onclick="window.sortByPrice()" class="btn btn-sm btn-light" style="border:1px solid #ccc; flex:1;">💰 السعر</button>
        <button onclick="window.sortByName()" class="btn btn-sm btn-light" style="border:1px solid #ccc; flex:1;">🔤 الاسم</button>
        <select id="formFilter" onchange="window.filterByForm(this.value)" style="flex:1.5; padding:5px; border-radius:5px;">${formOptions}</select>
        <select id="companyFilter" onchange="window.currentCompany=this.value; window.applyFilters();" style="flex:1.5; padding:5px; border-radius:5px;"></select>
        <select id="strengthFilter" onchange="window.currentStrength=this.value; window.applyFilters();" style="flex:2; padding:5px; border-radius:5px;"></select>
    `);

    if (typeof fillCompanyFilter === "function") fillCompanyFilter(window.fullList);
    if (typeof fillStrengthFilter === "function") fillStrengthFilter(window.fullList);
};

/* ================== 5. HELPER FUNCTIONS ================== */
function extractStrength(drug) {
    if (!drug) return "";
    // دمج الاسم والجرعة للبحث الشامل
    let searchText = `${drug.name || ""} ${drug.dose || ""}`.toLowerCase();
    
    // 1. تنظيف النص: تحويل i.u. أو i. u إلى iu لسهولة الالتقاط
    searchText = searchText.replace(/i\.?\s?u\.?/gi, "iu");

    // 2. ريجيكس متطور جداً:
    // يلتقط الأرقام مثل (200.000 أو 10/10 أو 500) 
    // متبوعة بوحدات مثل (iu أو mg) 
    // مع إمكانية وجود تكملة مثل (/1ml)
    const complexRegex = /(\d{1,3}(?:\.\d{3})*(?:[\.,]\d+)?|\d+(?:\/\d+)*)\s*(iu|mg|ml|mcg|gm|g|%)(?:\s*[\/]\s*\d*\s*(ml|mg|gm|g|iu))?/gi;
    
    const matches = searchText.match(complexRegex);

    if (matches) {
        // تنظيف النتيجة النهائية (إزالة المسافات وتوحيد النقاط)
        let result = matches[0].toLowerCase()
            .replace(/\s+/g, "")
            .replace(/,/g, ".");
            
        return result;
    }
    return "";
}

window.filterByForm = function(val) {
    window.currentFilterForm = (val || "all").toLowerCase().trim();
    window.currentStrength = "all";
    window.applyFilters();
};

window.sortByPrice = function() {
    window.currentList.sort((a,b)=> window.sortPriceAsc ? (parseFloat(a.price)||0)-(parseFloat(b.price)||0) : (parseFloat(b.price)||0)-(parseFloat(a.price)||0));
    window.sortPriceAsc = !window.sortPriceAsc;
    window.redrawList();
};

window.sortByName = function() {
    window.currentList.sort((a,b)=> window.sortNameAsc ? (a.name||"").localeCompare(b.name||"") : (b.name||"").localeCompare(a.name||""));
    window.sortNameAsc = !window.sortNameAsc;
    window.redrawList();
};
/* ================== SIMILAR ================== */

function getSimilar(active){

    $('#resultDiv').html("");
    $('#inpSearch').val("");

    fullList = [];
    currentList = [];
    currentFilterForm = "all";
    currentCompany = "all";

    if(!active){
        $('#resultDiv').html("<div class='alertResulte'>No Similars Found</div>");
        return;
    }

    allDrugz.forEach(drug=>{
        if(
            drug.active &&
            drug.active.trim().toLowerCase() === active.trim().toLowerCase()
        ){
            fullList.push(drug);
        }
    });

    if(fullList.length === 0){
        $('#resultDiv').html("<div class='alertResulte'>No Similars Found</div>");
        return;
    }

    fullList = fullList.slice(0,150);
    currentList = [...fullList];

    redrawList();
    $('#resultDiv').scrollTop(0);
}

window.getSimilar = getSimilar;

/* ================== ALTERNATIVE ================== */

function getAlt(description,active){

    $('#resultDiv').html("");
    $('#inpSearch').val("");

    fullList = [];
    currentList = [];
    currentFilterForm = "all";
    currentCompany = "all";

    if(!description){
        $('#resultDiv').html("<div class='alertResulte'>No Alternatives Found</div>");
        return;
    }

    allDrugz.forEach(drug=>{
        if(
            drug.description &&
            drug.description.trim().toLowerCase() === description.trim().toLowerCase() &&
            drug.active !== active
        ){
            fullList.push(drug);
        }
    });

    if(fullList.length === 0){
        $('#resultDiv').html("<div class='alertResulte'>No Alternatives Found</div>");
        return;
    }

    fullList = fullList.slice(0,150);
    currentList = [...fullList];

    redrawList();
    $('#resultDiv').scrollTop(0);
}

window.getAlt = getAlt;


// expose to global scope
window.filterByForm = filterByForm;

    const advancedSearchOption = '<span class="spanSlidy">Advanced Search</span><hr style="margin:2px">';
    $('.divSlidyInp').append(advancedSearchOption);
function moreInfo(name, arabic, active, price, oldprice, description, dosage_form, details, barcode, company, unite, units, route, imageUrl, indications, dose = "") {
    console.log("قاعدة بيانات التداخلات:", window.interactionsDB);
    console.log("المادة الفعالة الحالية:", active);

    // 1. إظهار الجدول وتصفير النتائج
    $('#tableInfo').show();
    $('#btn_print').hide();
    $('#dafte').hide();
    $('#resultDiv').html("");

    // 2. ملء البيانات الأساسية
    $('#name').html(name);
    $('#nameArabic').html(arabic);
    $('#active').html(active);
    $('#price').html(price + ' L.E');
    $('#oldprice').html("<del>" + oldprice + ' L.E' + "</del>");
    $('#description').html(description);
    $('#dosage_form').html(dosage_form);
    $('#details').html(details);
    $('#barcode').html(barcode);
    $('#company').html(company);
    $('#unite').html(unite);
    $('#unitePrice').html(units + ' L.E');
    $('#route').html(route);
    $('#category').html(indications); 

    // 3. عرض الصورة
    $('#largeImage').html(`<img src="${imageUrl}" alt="صورة الدواء" style="max-width: 100%; height: auto; border-radius: 8px;">`);

    // --- منطق التداخلات الدوائية ---
    let interactionsHTML = "";
    const iDB = window.interactionsDB;

    if (iDB && active) {
        const activeIngredients = active.toLowerCase().split(/[+/ ,]+/).map(item => item.trim());
        let foundInteractions = [];

 activeIngredients.forEach(singleActive => {
    Object.keys(iDB).forEach(dbKey => {
        // تحويل الطرفين لحروف صغيرة والتأكد من وجود الكلمة
        if (singleActive.toLowerCase().trim().includes(dbKey.toLowerCase().trim())) {
            iDB[dbKey].forEach(inter => {
                foundInteractions.push({ withDrug: inter.withDrug, message: inter.message });
            });
        }
    });
});

        const uniqueInteractions = Array.from(new Map(foundInteractions.map(item => [item.withDrug, item])).values());

        if (uniqueInteractions.length > 0) {
            interactionsHTML = `
                <div id="interactionBlock" style="margin-top:15px; background:#fff5f5; padding:15px; border-radius:10px; border-right: 6px solid #d32f2f; direction: rtl; text-align: right; border: 1px solid #ffcccc;">
                    <b style="color:#c62828; font-size:14px; display:block; margin-bottom:8px;">⚠️ تنبيهات التداخلات الدوائية:</b>
                    <div style="font-size: 13px; color: #333; line-height: 1.6;">

			${uniqueInteractions.map(inter => `
		<div style="margin-bottom:6px; border-bottom: 1px dashed #ffcccc; padding-bottom:4px;">
			<span style="color:#d32f2f; font-weight:bold;">
            • مع <a href="javascript:void(0);" 
                    onclick="searchByIngredient('${inter.withDrug}')" 
                    style="color:#d32f2f; text-decoration: underline; cursor: pointer;">
                    ${inter.withDrug}
                 </a>:
        </span> 
        <span>${inter.message}</span>
    </div>
`).join('')}
                    </div>
                </div>`;
        }
    }

    // حقن التداخلات في العناصر المتاحة
    if ($('#modalBody').length > 0) {
        $('#modalBody').html(`
            <div style="text-align:right; direction:rtl;">
                <h3 style="color:#2c3e50;">${name}</h3>
                <p style="color:#7f8c8d;">${arabic}</p>
                <div id="interactionArea">${interactionsHTML}</div>
            </div>
        `);
    } else {
        console.error("عنصر modalBody غير موجود، سيتم البحث عن بدائل لعرض التداخلات.");
    }

    // حقن في الحاوية المخصصة إن وجدت
    $('#interactionsContainer').html(interactionsHTML);

    $('#detailsModal').modal('show');

    // 4. تجهيز المتغيرات الموحدة
    const activeLow = active ? active.toLowerCase().trim() : '';
    const formLower = dosage_form ? dosage_form.toLowerCase() : "";
    const rl = route ? route.toLowerCase() : ""; 
    const doseLow = dose ? dose.toLowerCase() : "";

    // 5. معالجة بيانات الأمان
    const lactRef = { "L1": "آمن تماماً", "L2": "آمن غالباً", "L3": "آمن بحذر", "L4": "خطر محتمل", "L5": "ممنوع" };
    $('#pregSafety, #lactSafety, #contraindications').html('--').css('background-color', 'transparent');

    if (typeof indicationsDB !== 'undefined') {
        const firstKey = activeLow.split('+')[0].trim();
        const entry = indicationsDB[activeLow] || indicationsDB[firstKey];

        if (entry && entry.safety) {
            const isTopical = formLower.includes('eye') || formLower.includes('ear') || rl.includes('eye');
            const isPed = (formLower.includes('suspension') || formLower.includes('syrup') || (formLower.includes('drops') && !isTopical)) 
                          && !formLower.includes('vaginal') 
                          && !formLower.includes('suppository')
                          && !formLower.includes('ovule'); 

            if (!isPed) {
                const pCat = entry.safety.preg || "?";
                let pBg = (pCat === "X") ? "#ffebee" : (pCat === "D") ? "#fff3e0" : (pCat === "C") ? "#fffde7" : "#e8f5e9";
                const pNote = entry.safety.pregNote ? `<br><small style="color:#d32f2f; font-weight:bold;">⚠️ ${entry.safety.pregNote}</small>` : "";
                $('#pregSafety').html(`<b>(${pCat})</b> ${pNote}`).css('background-color', pBg);
                
                const lCat = entry.safety.lact || "?";
                $('#lactSafety').html(`<b>(${lCat})</b>: ${lactRef[lCat] || lCat}`);
            } else {
                $('#pregSafety, #lactSafety').html('<span style="color:gray; font-size:11px;">صنف خاص بالأطفال</span>');
            }

            let sensitivityAlert = "";
            const isInjection = formLower.includes('vial') || formLower.includes('amp') || rl.includes('inject');
            if (entry.safety.needsTest && isInjection) {
                sensitivityAlert = `<div style="color: #fff; background: #d32f2f; padding: 10px; border-radius: 5px; margin-bottom: 8px; text-align: center; font-weight: bold;">🛑 تنبيه: يتطلب اختبار حساسية قبل الحقن</div>`;
            }

            let milkWarning = "";
            const quinolones = ['ciprofloxacin', 'levofloxacin', 'moxifloxacin', 'doxycycline', 'tetracycline', 'minocycline'];
            const isOral = formLower.includes('tablet') || formLower.includes('capsule');
            if (isOral && quinolones.some(q => activeLow.includes(q))) {
                milkWarning = "<br><div style='color:#e65100; font-weight:bold;'>⚠️ تنبيه امتصاص: يجب الفصل عن منتجات الألبان والمعادن بساعتين.</div>";
            }

            const contraText = entry.safety.contra || 'لا توجد موانع خاصة مسجلة';
            
            // إضافة التداخلات إلى خانة الموانع لضمان ظهورها حتى لو الـ Modal غير موجود
            $('#contraindications').html(sensitivityAlert + contraText + milkWarning + interactionsHTML);
        }
    }

    // 6. ترجمة طريقة الاستخدام
    let routeAr = route; 

    if (rl.includes('eye')) routeAr = '👁️ قطرة أو مرهم للعين';
    else if (rl.includes('ear')) routeAr = '👂 قطرة للأذن';
    else if (rl.includes('nasal') || rl.includes('nose')) routeAr = '👃 بخاخ أو نقط للأنف';
    else if (rl.includes('oral.solid') || rl.includes('tablet') || rl.includes('capsule')) routeAr = '💊 أقراص أو كبسول عن طريق الفم';
    else if (rl.includes('oral.liquid') || rl.includes('suspension') || rl.includes('syrup')) routeAr = '🧪 شرب عن طريق الفم';
    else if (rl.includes('mouth') || rl.includes('oral.gel') || rl.includes('gargle')) routeAr = '👄 مضمضة أو جل للفم';
    else if (rl.includes('injection') || rl.includes('vial') || rl.includes('amp') || rl.includes('powder') || rl.includes('subcutaneous')) {
        if (activeLow.includes('insulin')) routeAr = '💉 حقن تحت الجلد (أنسولين)';
        else if (activeLow.includes('enoxaparin') || activeLow.includes('heparin') || activeLow.includes('clexane')) routeAr = '💉 حقن مسبقة التعبئة تحت الجلد (للسيولة)';
        else if (rl.includes('im') && !rl.includes('iv')) routeAr = '💉 حقن عضلي فقط (IM)';
        else if (rl.includes('iv') && !rl.includes('im')) routeAr = '💉 حقن وريدي فقط (IV)';
        else routeAr = '💉 حقن (عضلي أو وريدي حسب النوع)';
    }
    else if (rl.includes('topical') || rl.includes('cream') || rl.includes('gel') || rl.includes('ointment') || rl.includes('lotion')) routeAr = '🧴 دهان موضعي على الجلد';
    else if (rl.includes('rectal') || rl.includes('suppository')) routeAr = '🍑 تحاميل (لبوس)';
    else if (rl.includes('vaginal')) routeAr = '🌸 لبوس أو كريم مهبلي';
    else if (rl.includes('inhalation') || rl.includes('respiratory') || rl.includes('inhaler')) routeAr = '🌬️ استنشاق (بخاخ للصدر)';

    if (doseLow.includes('1x1') || doseLow.includes('once daily')) routeAr += ' [مرة واحدة يومياً]';
    else if (doseLow.includes('2x1') || doseLow.includes('twice daily') || doseLow.includes('1x2')) routeAr += ' [مرتين يومياً]';
    else if (doseLow.includes('3x1') || doseLow.includes('three times') || doseLow.includes('1x3')) routeAr += ' [3 مرات يومياً]';

    $('#routeArabic').html(routeAr);
}

window.moreInfo = moreInfo;
window.searchByIngredient = function(ingredientName) {
    $('#detailsModal').modal('hide');

    // محاولة إيجاد حقل البحث بأكثر من طريقة
    let searchInput = $('#searchInput'); // البحث بـ ID شهير
    if (searchInput.length === 0) {
        // إذا لم يجده، يبحث عن أي input نصي داخل شريط التنقل أو الصفحة
        searchInput = $('input[type="text"], input[type="search"]').first();
    }
    
    if (searchInput.length > 0) {
        searchInput.val(ingredientName).focus();
        searchInput.trigger('input').trigger('keyup'); // تشغيل الفلترة
        window.scrollTo(0, 0);
    } else {
        console.error("لم يتم العثور على حقل البحث. تأكد من وجود <input id='searchInput'> في الـ HTML.");
    }
};
  window.printDiv = function() {
        window.frames['print_fream'].document.body.innerHTML = document.getElementById('printTable').innerHTML;
        window.frames['print_fream'].window.focus();
        window.frames['print_fream'].window.print();
    }
});
document.getElementById("inpSearch").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        const inputField = this;
        
        // التحقق مما إذا كان المدخل يحتوي على عمليات حسابية فقط (للحماية)
        // هذا السطر يتأكد أن المستخدم كتب أرقام أو علامات حسابية فقط
        if (/[0-9+\-*/(). ]/.test(inputField.value)) {
            try {
                // تنفيذ العملية الحسابية
                const result = Function('"use strict";return (' + inputField.value + ')')();
                
                // التأكد أن النتيجة رقم وليس شيئاً آخر
                if (typeof result === 'number' && isFinite(result)) {
                    inputField.value = result;
                    inputField.classList.remove("input-error");
                } else {
                    throw new Error("Invalid Math");
                }
            }
			catch (e) {
                // تنفيذ تأثير الخطأ بدلاً من الـ alert
                showInputError(inputField);
            }
        }
    }
});


window.printDiv = function() {
    window.frames['print_fream'].document.body.innerHTML = document.getElementById('printTable').innerHTML;
    window.frames['print_fream'].window.focus();
    window.frames['print_fream'].window.print();
};

// وظيفة الحاسبة في حقل البحث
document.getElementById("inpSearch").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        const inputField = this;
        if (/[0-9+\-*/(). ]/.test(inputField.value)) {
            try {
                const result = Function('"use strict";return (' + inputField.value + ')')();
                if (typeof result === 'number' && isFinite(result)) {
                    inputField.value = result;
                    inputField.classList.remove("input-error");
                } else {
                    throw new Error("Invalid Math");
                }
            }
            catch (e) {
                // تفعيل تأثير الخطأ
                if (typeof showInputError === 'function') showInputError(inputField);
            }
        }
    }
});
// وظيفة إظهار الخطأ بشكل جمالي
function showInputError(element) {
    element.classList.add("input-error");
    
    // إعادة الحقل لشكلة الطبيعي بعد ثانية واحدة
    setTimeout(() => {
        element.classList.remove("input-error");
    }, 1000);
}
// عند الضغط على زر الدارك
function toggleDarkMode() {
  document.body.classList.toggle("dark");

  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
}



// عند فتح التطبيق
window.onload = () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    document.getElementById("darkBtn").innerText = "☀️ الوضع النهاري";
  }
};
  ThemeManager.init();

function showToast(msg, type = "success"){
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  
  setTimeout(() => {
    toast.className = "toast";
  }, 2500);
}

// تعريف الدالة على window لضمان وصول الـ HTML إليها
window.setSearchMode = function(mode) {
    const modeInput = $('#searchMode');
    const slidyDiv = $('#divSlidyInp');

    if (mode === 'name') {
        modeInput.val("الأسم التجاري");
    } else if (mode === 'active') {
        modeInput.val("المادة الفعالة");
    } else if (mode === 'pharma') {
        modeInput.val("الفارماكولوجي");
    } else if (mode === 'advanced') {
        modeInput.val("Advanced Search");
    }

    // إخفاء القائمة
    slidyDiv.hide();

    // طباعة للـ Console للتأكد من التنفيذ
    console.log("Search Mode Changed to: " + modeInput.val());

    // تحديث البحث فوراً
    $('#inpSearch').trigger('keyup');
};
// أضف هذه الدالة في ملف main.js
function showInputError(element) {
    element.classList.add("input-error");
    setTimeout(() => {
        element.classList.remove("input-error");
    }, 1000);
}
// بديل مؤقت
const ThemeManager = {
    init: function() {
        if (localStorage.getItem("theme") === "dark") {
            document.body.classList.add("dark");
        }
    }
};
ThemeManager.init();