<?php

namespace App\Http\Controllers;

use App\Heatmap;
use App\HeatmapTime;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class HeatmapController extends Controller
{
    /**
     * Get all the heatmap data for specific scene
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request)
    {
        if ($request->user_number == 'all') {
            $heatmap_trails = Heatmap::all()->where('scene_number', $request->scene);
        }else{
            $heatmap_trails = Heatmap::all()->where('user_number', $request->user_number)
                                            ->where('scene_number', $request->scene);
        }

        return response()->json([
            'result' => $heatmap_trails
        ], 200);
    }

    /**
     * Create a heatmap trail
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function create(Request $request) {
        $search = DB::table('heatmaps')->where('user_number', $request->user_number)
                                       ->where('position_x', $request->position_x)
                                       ->where('position_y', $request->position_y)
                                       ->where('position_z', $request->position_z)->first();

        if($search) {
            $heatmap_trail = Heatmap::findOrFail($search->id);

            if($heatmap_trail->update($request->all())) {
                return response()->json([
                    'message' => 'Updated'
                ], 200);
            }
        }else{
            $heatmap_trail = Heatmap::create($request->all());

            if($heatmap_trail->save()){
                return response()->json([
                    'message' => 'Saved'
                ], 200);
            }
        }
    }

    public function show_time(Request $request) {
        $heatmap_time = HeatmapTime::all()->where('scene_number', $request->scene);

        return response()->json([
            'result' => $heatmap_time
        ], 200);
    }

    public function create_time(Request $request) {
        $search = DB::table('heatmaps_time')->where('user_number', $request->user_number)
                                            ->where('scene_number', $request->scene_number)->first();

        if($search) {
            $heatmap_time = HeatmapTime::findOrFail($search->id);

            $old_time = $heatmap_time->time;
            $new_time = $request->time + $old_time;

            if($heatmap_time->update(['time' => $new_time])) {
                return response()->json([
                    'message' => 'Updated'
                ], 200);
            }
        }else{
            $heatmap_time = HeatmapTime::create($request->all());

            if($heatmap_time->save()){
                return response()->json([
                    'message' => 'Saved'
                ], 200);
            }
        }
    }

    public function getNextHouseUser() {
        $search = Heatmap::select('user_number')->orderBy('user_number','asc')->distinct()->get();

        $next_user_number = count($search) + 1;

        return response()->json([
            'value' => $next_user_number
        ], 200);
    }
}
