@extends('payment')

@section('title', 'پرداخت موفق')
@section('icon', '✅')
@section('heading', 'پرداخت موفق')

@section('content')
    <div class="flex  flex-col gap-2">
        
    <p class="font-bold">پرداخت شما با موفقیت انجام شد.</p>
    <p>شناسه تراکنش: <b>{{ $refId }}</b></p>
    <p>اعتبار سرویس شما تا تاریخ <b>{{ $vipUntil }}</b> فعال شد.</p>
    </div>
@endsection

