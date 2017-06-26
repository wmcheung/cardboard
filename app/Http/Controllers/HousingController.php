<?php

namespace App\Http\Controllers;

use App\Heatmap;
use App\HeatmapTime;
use App\HousingInfo;
use Illuminate\Http\Request;

class HousingController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        dd('test');
    }

    public function tour()
    {
        dd('test tour');
    }

    public function overview()
    {
        $housing_info = HousingInfo::where('id', 1)->get();
        $heatmap_times = HeatmapTime::orderBy('scene_number', 'asc')->get();
        $data_users = count(Heatmap::select('user_number')->orderBy('user_number','asc')->distinct()->get());
        $vr_images = 4;

        return view('housing.overview', compact('housing_info', 'data_users', 'vr_images', 'heatmap_times'));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
