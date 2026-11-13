
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="{{ asset('css/fonts.css') }}">
    <title>@yield('title', 'وضعیت پرداخت')</title>
    <script src="https://cdn.tailwindcss.com"></script>
   

    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              sans: ['Byekan', 'ui-sans-serif', 'system-ui'],
            },
          }
        }
      }
    </script>
</head>
<body class="bg-gray-100 [word-spacing:0.2em] min-h-screen  flex items-center justify-center font-sans p-4">

    <div class="bg-white shadow-2xl  mx-2 min-h-[40vh]  rounded-3xl p-6 sm:p-10 w-full lg:w-1/3 flex flex-col  gap-5  justify-between  ">
        {{-- عنوان --}}
        <div class="text-2xl font-bold w-full  flex  gap-3">
            @yield('icon') 
            <span class="">@yield('heading')</span>
        </div>

        {{-- محتوای اختصاصی --}}
        <div class="mb-8 text-gray-700 leading-relaxed ">
            @yield('content')
        </div>

        {{-- دکمه بازگشت به ربات --}}
        <a href="https://ble.ir/{{ config('services.bot.username') }}"
           class="block  text-center  w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4  rounded-2xl transition-colors duration-200 text-base sm:text-lg">
            بازگشت به ربات 🤖
        </a>
    </div>

</body>
</html>


