<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::prefix('housing')->group(function () {
    Route::get('create', 'HousingController@create');
    Route::get('tour', 'HousingController@tour');
    Route::get('dashboard', 'HousingController@overview');
});