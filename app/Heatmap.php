<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Heatmap extends Model
{
    protected $table = 'heatmaps';
    protected $fillable = ['user_number', 'scene_number', 'position_x', 'position_y', 'position_z', 'hex_color', 'radius', 'opacity'];
}
