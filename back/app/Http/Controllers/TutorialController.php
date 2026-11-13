<?php

namespace App\Http\Controllers;

use App\Models\Tutorial;
use Illuminate\Support\Str;

class TutorialController extends Controller
{
    public function show($slug, $title = null)
    {
        $tutorial = Tutorial::where('slug', $slug)->first();

        // اگر slug وجود نداشت → اولین ویدیو
        if (!$tutorial) {
            $tutorial = Tutorial::orderBy('id', 'asc')->firstOrFail();
        }

        // اگر title در URL با نسخه واقعی فرق داشت → ریدایرکت به URL درست
        if ($title !== Str::slug($tutorial->title)) {
            return redirect()->route('tutorials.show', [
                'slug'  => $tutorial->slug,
                'title' => Str::slug($tutorial->title),
            ]);
        }

        $otherTutorials = Tutorial::where('id', '!=', $tutorial->id)->get();

        return view('tutorials.show', compact('tutorial', 'otherTutorials'));
    }
    public function test(){
        return view('tutorials.show');
    }
}