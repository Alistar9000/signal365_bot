<html>
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="{{ asset('css/fonts.css') }}">
    <script src="https://tapi.bale.ai/miniapp.js?3"></script>
    <!--<script src="https://cdn.tailwindcss.com"></script>-->
   

    <!--<script>-->
    <!--  tailwind.config = {-->
    <!--    theme: {-->
    <!--      extend: {-->
    <!--        fontFamily: {-->
    <!--          sans: ['Byekan', 'ui-sans-serif', 'system-ui'],-->
    <!--        },-->
    <!--      }-->
    <!--    }-->
    <!--  }-->
    <!--</script>-->
    </head>
    <body>
        
    <div class="menuContainer">
        <p class="admin"></p>
        <div class="wrapper">
            
        <div class="menu">
            
                <div>💳 خرید / تمدید سرویس VIP</div>
                <div>📈 100 سهم برتر</div>
                <div>📢 لیست هشدار</div>
                <div>📌 سیگنال های امروز</div>
                <div>📊 بررسی سابقه سهم</div>
                <div>🆔 شناسه من</div>
                <div>💡 راهنمای ربات</div>
                <div>☎️ ارتباط با ما</div>
                <!--<div class='admin'>⚙️ مدیریت</div>-->
        </div>
                <div class="arrow">منو</div>
        </div>
    </div>
    <div class="d2">
    <!--@if(isset($user))-->
    <!--@if($user->is_Vip())-->
    <!--     <p>شما کاربر ویژه هستید</p> -->
    <!--     <p>زمان باقی مانده سرویس شما : {{$user->remaining_days}} روز</p> -->
    <!--@else-->
    <!--     <p>شما کاربر ویژه نیستید!</p> -->
    <!--     <p>برای دسترسی به بخش های مختلف ربات نیاز به خرید سرویس vip دارید</p> -->
    <!--     <button>خرید سرویس</button>-->
    
    <!--@endif-->
    <!--@else -->
    <!--     <p>دسترسی غیرمجاز!</p> -->
    
    <!--@endif-->
    </div>
    <div class='d3'>لطفا از طریق اپلیکیشن بله وارد شود</div>
    </body>
    
     <script>
     
       const rep = window.Bale.WebApp.initData;
       if(!rep){
          document.querySelector('.d2').style.display='none';
          document.querySelector('.menuContainer').style.display='none';
          
       }else{
           document.querySelector('.d3').style.display='none';
       }
       
      const menuItems = document.querySelectorAll('.menu *');
      
      menuItems.forEach((item,index) => {
          item.addEventListener('click',function(){
          let url = '';
        
        switch(index) {
            case 0: url = '/api/purchase'; break;
            case 1: url = '/api/vip/top100'; break;
            case 2: url = '/api/vip/alarms'; break;
            case 3: url = '/api/vip/today_signals'; break;
            case 4: url = '/api/get_id'; break;
            case 5: url = '/api/guide'; break;
            case 6: url = '/api/contact_us'; break;
            case 7: url = '/api/admin'; break;
        }

        if(url) {
            Fetch(url);
        }
      });
      });
      
     async function Fetch(route) {
    try {
        const response = await fetch(route, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        // چک کن که پاسخ OK باشه
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('is_admin: ', result['is_admin']);
    } catch (error) {
        console.error('خطا در fetch:', error);
    }
}
      
     
      verifyAdmin(); 
     async function verifyAdmin(){
          const response = await fetch("{{route('admin')}}",{
               method:'POST',
               headers: {
                'Content-Type': 'application/json'
              },
               body:JSON.stringify({initData : rep})
           });
           
           const result = await response.json();
           console.log('result: ',JSON.parse(result.initData));
        //   console.log('result: ',JSON.parse(result.initData).id);
           document.querySelector('.admin').innerText = result.initData['id'];
       }
    //   const admin = document.querySelector('.admin');
    //   const result = verifyAdmin();
      
    //   if(result['is_admin'])
        // admin.innerHTML=result.data;
    //   document.querySelector('.admin').style.display='block';
    //   else
    //   document.querySelector('.admin').style.display='none';
      
      const menu = document.querySelector('.wrapper');
     
      document.querySelector('.arrow').addEventListener('click',function(){
          if(menu.style.height !='0px'){
                menu.style.height='0px';
          }
          else  menu.style.height='auto';       
      });
      
    </script
</html>
