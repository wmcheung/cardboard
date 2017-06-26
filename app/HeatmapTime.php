<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class HeatmapTime extends Model
{
    protected $table = 'heatmaps_time';
    protected $fillable = ['user_number', 'scene_number', 'time'];
}
