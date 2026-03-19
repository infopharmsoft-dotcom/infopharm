//$(document).ready(function(){
includeHere.innerHTML = `
<div class="upperDiv">
<a href="index.html" style="font-size:20px;color:#fff;text-decoration:none">
<span>
<img src="img/logo.png" height="50" width="50" style="border-radius:50%;"  >
</span>
<span style="padding:5px;border-radius:5px;font-size:20px;font-weight:bold">
Infopharm 
  <span id='getUpdateDate' style='font-size:18px;color:yellow'></span>
</span>
</a>

<span class="togMenu" style="float:right;font-size:60px;padding:15px;">
≡
</span>

</div>


<style>

@font-face {
  font-family: Tajawal;
  src: url(tajawal.ttf);
}

*{
font-family: 'Tajawal', sans-serif;
box-sizing: border-box;
}
a{
text-decoration:none;
}
body{
line-height:1;
box-sizing: border-box;
background-repeat: no-repeat;
margin:0;
padding:0;
}



.upperDiv{
padding:10px;
margin:0;
background:#123;
color:#fff;
font-size:20px;
font-weight:bold;
line-height:30px;
}
.menuItem{
text-align:left;
display:block;
color:#000;
font-weight:bold;
padding:10px;
margin:10px;
border:0;
border-radius:6px;
background: #CEE3F6;
}

.fixedBtn{
font-size:25px;
width:40%;
}


.page::after {
 content: "";
 position: fixed;
 width: 300%;
 height: 100%;
 background-color:#2E9AFE;
 left: 50%;
 top: 50%;
 transform: translateX(-50%) skew(0, -10deg);
 border-radius: 50%;
 z-index: -1;
 animation: waving 2s ease-in-out infinite alternate;
}

@keyframes waving {
from {
transform: translateX(-50%) skew(0, -10deg);
}
to{
transform: translateX(-30%) skew(10deg, 0);
}
}


</style>

 `
 

/*
footer.innerHTML = `


<div align="center" style="position:fixed;left:0;bottom:0;height:70px;text-align:center;background:#610B21;width:100%;padding-top:20px;margin:5px auto">
<a class='fixedBtn' href="online/online.html" >
<button class="btn btn-primary">
Online Version &#9889; 
</button>
</a>


<a class='fixedBtn' href="update.html">
<button class="btn btn-success">

Update Prices 💫 
</button>
</a>
<br><br>
</div>

`
*/

$(document).on('click', '.togMenu', function(){ 
$('.slidingMenu').toggle();
});


$(document).on('click','.container', function(){ 
$('.slidingMenu').hide();
});
if(localStorage.getItem("updateDate")){
getUpdateDate.innerHTML = localStorage.getItem("updateDate");
}

