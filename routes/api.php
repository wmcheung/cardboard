<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

// No need for authentication since we're in a prototyping process. Start using auth:api when we go through user based process
Route::get('/heatmap', 'HeatmapController@show');
Route::post('/heatmap', 'HeatmapController@create');
Route::get('/time', 'HeatmapController@show_time');
Route::post('/time', 'HeatmapController@create_time');
Route::get('/next-housing-user', 'HeatmapController@getNextHouseUser');