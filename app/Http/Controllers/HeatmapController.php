<?php

namespace App\Http\Controllers;

use App\Heatmap;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class HeatmapController extends Controller
{
    /**
     * Get all the heatmap data for specific scene
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request) {
        $heatmap_trails = Heatmap::all()->where('scene_number', $request->scene);

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
        $search = DB::table('heatmaps')->where('position_x', $request->position_x)
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
}
