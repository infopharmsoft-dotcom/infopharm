$(document).ready(function(){
    includeHere.innerHTML = `
    <div class="upperDiv">
        <a href="index.html" style="font-size:20px;color:#fff;text-decoration:none">
            <span>
                <img src="img/logo.png" height="50" width="50" style="border-radius:50%;">
            </span>
            <span style="padding:5px;border-radius:5px;font-size:20px;font-weight:bold">
                Infopharm 
                <span id='getUpdateDate' style='font-size:18px;color:yellow'></span>
            </span>
        </a>
        <span class="togMenu" style="float:right;font-size:60px;padding:15px;cursor:pointer;">≡</span>
    </div>

    <div class="slidingMenu" style="display:none; position:fixed; top:70px; left:0; width:280px; height:calc(100% - 70px); background:white; z-index:1000; box-shadow:2px 0 15px rgba(0,0,0,0.2); border-top-left-radius: 20px; border-bottom-left-radius: 20px; overflow-y:auto;">
        <div style="padding:20px;">
            <div style="text-align:center; margin-bottom:20px;">
                <img src="img/logo.png" height="70" width="70" style="border-radius:50%;">
                <h4 style="margin-top:10px; color:#123;">Infopharm</h4>
                <p style="font-size:12px; color:#666;">دليل الأدوية المصري</p>
            </div>
            
            <a href="index.html" class="menuItem" style="display:flex; align-items:center; gap:10px; text-decoration:none; color:#333; padding:12px; margin:5px 0; border-radius:12px; background:#f5f5f5;">
                <span style="font-size:24px;">🏠</span>
                <span style="font-weight:bold;">الرئيسية</span>
            </a>
            
            <a href="about.html" class="menuItem" style="display:flex; align-items:center; gap:10px; text-decoration:none; color:#333; padding:12px; margin:5px 0; border-radius:12px; background:#f5f5f5;">
                <span style="font-size:24px;">ℹ️</span>
                <span style="font-weight:bold;">عن التطبيق</span>
            </a>
            
            <a href="guide.html" class="menuItem" style="display:flex; align-items:center; gap:10px; text-decoration:none; color:#333; padding:12px; margin:5px 0; border-radius:12px; background:#f5f5f5;">
                <span style="font-size:24px;">📖</span>
                <span style="font-weight:bold;">شرح التطبيق</span>
            </a>
            
            <a href="privacy.html" class="menuItem" style="display:flex; align-items:center; gap:10px; text-decoration:none; color:#333; padding:12px; margin:5px 0; border-radius:12px; background:#f5f5f5;">
                <span style="font-size:24px;">🔒</span>
                <span style="font-weight:bold;">سياسة الخصوصية</span>
            </a>
            
            <a href="disclaimer.html" class="menuItem" style="display:flex; align-items:center; gap:10px; text-decoration:none; color:#333; padding:12px; margin:5px 0; border-radius:12px; background:#f5f5f5;">
                <span style="font-size:24px;">⚠️</span>
                <span style="font-weight:bold;">إخلاء المسؤولية</span>
            </a>
            
            <hr style="margin:15px 0;">
            
            <div style="text-align:center; padding:10px;">
                <p style="font-size:11px; color:#999;">الإصدار 2.0.0</p>
                <p style="font-size:11px; color:#999;">&copy; 2024 Infopharm</p>
            </div>
			<button onclick="openSettings()" class="menuItem" style="display:flex; align-items:center; gap:10px; text-decoration:none; color:#333; padding:12px; margin:5px 0; border-radius:12px; background:#f5f5f5; width:100%; border:none; cursor:pointer;">
    <span style="font-size:24px;">⚙️</span>
    <span style="font-weight:bold;">الإعدادات</span>
</button>
        </div>
    </div>

    <style>
        @font-face {
            font-family: Tajawal;
            src: url(tajawal.ttf);
        }
        
        * {
            font-family: 'Tajawal', sans-serif;
            box-sizing: border-box;
        }
        
        a {
            text-decoration: none;
        }
        
        body {
            line-height: 1;
            background-repeat: no-repeat;
            margin: 0;
            padding: 0;
            background: #f0f2f5;
        }
        
        .upperDiv {
            padding: 10px;
            margin: 0;
            background: #123;
            color: #fff;
            font-size: 20px;
            font-weight: bold;
            line-height: 30px;
            position: sticky;
            top: 0;
            z-index: 999;
        }
        
        .menuItem {
            text-align: right;
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: #000;
            font-weight: bold;
            padding: 12px;
            margin: 8px 0;
            border: 0;
            border-radius: 12px;
            background: #f5f5f5;
            transition: all 0.3s ease;
        }
        
        .menuItem:hover {
            background: #e0e0e0;
            transform: translateX(-5px);
        }
        
        .slidingMenu {
            direction: rtl;
        }
        
        .togMenu {
            transition: transform 0.3s;
        }
        
        .togMenu:hover {
            transform: scale(1.1);
        }
    </style>
    `;

    $(document).on('click', '.togMenu', function(e){ 
        e.stopPropagation();
        $('.slidingMenu').toggle();
    });

    $(document).on('click', '.container, #main-content', function(){ 
        $('.slidingMenu').hide();
    });
    
    $(document).on('click', '.slidingMenu', function(e){
        e.stopPropagation();
    });
    
    if(localStorage.getItem("updateDate")){
        document.getElementById('getUpdateDate') && (document.getElementById('getUpdateDate').innerHTML = localStorage.getItem("updateDate"));
    }
});