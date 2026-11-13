<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $tutorial->title }} | آموزش‌ها</title>
    <link rel="stylesheet" href="{{ asset('css/fonts.css') }}">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 h-screen [word-spacing:0.2em] w-full">

<div class=" mx-auto py-8 px-4 flex flex-col md:flex-row flex-1 h-full  flex gap-6">
    {{-- بخش ویدیو --}}
    
        
   
    <div class="md:flex-[3] flex-2 md:flex-1 flex h-full flex-col bg-white p-6 rounded-2xl shadow-lg">
        <h1 class="text-xl flex-1 mb-4 md:mb-0  font-bold ">{{ $tutorial->title }}</h1>
        
        {{-- ویدیو --}}
        <div class="flex-[5] md:flex-[3] max-h-[67vh] aspect-video relative  mb-2 ">
            <video controls class="absolute object-cover top-0 left-0 w-full h-full rounded-lg">
                <source src="{{ $tutorial->video_url }}" type="video/mp4">
                مرورگر شما از ویدیو پشتیبانی نمی‌کند.
            </video>
        </div>

        {{-- توضیحات --}}
        <div class="flex-1">
           
        <p class="block text-sky-400 text-sm md:hidden">اگر حالت تمام صفحه غیر فعال است برروی سه نقطه بالای صفحه و سپس گزینه open-in بزنید</p>    
       
        <p class="text-gray-700 text-sm  leading-relaxed">
            {{ $tutorial->description }}
        </p>
        </div>
   
 </div>
    {{-- لیست آموزش‌ها --}}
    <div class="bg-white  flex-1 p-6 rounded-2xl shadow-lg">
        <h2 class="text-lg font-bold mb-3">سایر آموزش‌ها</h2>
        <ul class="space-y-2">
            @foreach($otherTutorials as $item)
                <li>
                    <a href="{{ route('tutorials.show', ['slug' => $item->slug, 'title' => Str::slug($item->title)]) }}"
                       class="block p-2 text-sky-400 rounded hover:bg-gray-100 transition">
                       ▪️ {{ $item->title }}
                    </a>
                </li>
            @endforeach
        </ul>
    </div>
</div>

</body>
</html>