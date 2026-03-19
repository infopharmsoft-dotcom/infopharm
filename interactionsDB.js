window.interactionsDB = {
    "warfarin": [
        { withDrug: "aspirin", message: "زيادة كبيرة في خطر النزيف" },
        { withDrug: "clopidogrel", message: "زيادة قوية في خطر النزيف والسيولة" },
        { withDrug: "metronidazole", message: "يرفع الـ INR بشكل خطير" }
    ],
    "clopidogrel": [
        { withDrug: "omeprazole", message: "يقلل فاعلية البلافكس" },
        { withDrug: "aspirin", message: "زيادة خطر نزيف المعدة" }
    ],
    // تم حذف الـ e من digoxine لضمان المطابقة
    "digoxine": [
        { withDrug: "furosemide", message: "نقص البوتاسيوم الناتج عن اللازيكس يزيد من سمية الديجوكسين (خطر على القلب)" },
        { withDrug: "clarithromycin", message: "يرفع تركيز الديجوكسين في الدم بشكل كبير (خطر التسمم الرقمي)" },
        { withDrug: "spironolactone", message: "يرفع مستوى الديجوكسين؛ يجب مراقبة نبض القلب بدقة" }
    ],
    "methotrexate": [
        { withDrug: "NSAIDs (المسكنات)", message: "خطر جداً؛ المسكنات تمنع خروج الميثوتركسيت من الكلى مما يسبب تسمم وفشل كلوي" },
        { withDrug: "PPI (أدوية المعدة)", message: "مثل الأوميبرازول؛ قد تؤخر خروج الدواء من الجسم وتزيد سميته" },
        { withDrug: "Trimethoprim (Septra)", message: "يزيد من خطر هبوط نخاع العظام ونقص المناعة الشديد" }
    ],
    "lithium": [
        { withDrug: "ACE Inhibitors", message: "مثل الكابوتن؛ ترفع مستوى الليثيوم لمستويات سامة فوراً" },
        { withDrug: "Diuretics", message: "تسبب جفافاً يرفع تركيز الليثيوم بشكل خطير" },
        { withDrug: "NSAIDs", message: "تقلل تخلص الكلى من الليثيوم مما يؤدي للتسمم" }
    ],
    "amiodarone": [
        { withDrug: "Statins", message: "يزيد خطر تحلل العضلات خاصة مع السيمفاستاتين" },
        { withDrug: "Warfarin", message: "يرفع سيولة الدم بشكل مفاجئ؛ يجب تقليل جرعة الماريفان" }
    ],
    "sildenafil": [
        { withDrug: "Nitrates", message: "ممنوع نهائياً؛ يسبب هبوطاً حاداً ومميتاً في ضغط الدم" }
    ],
    "tadalafil": [
        { withDrug: "Nitrates", message: "ممنوع نهائياً؛ يسبب هبوطاً حاداً ومميتاً في ضغط الدم (مفعوله يمتد لـ 36 ساعة)" }
    ]
};