<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\TsetmcService;

class TsetmcController extends Controller
{
    
    public function get()
{
    $service = new TsetmcService();
    $data = $service->getMarketWatch();

    return response()->json($data['marketWatch']);
}
    
}