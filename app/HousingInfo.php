<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class HousingInfo extends Model
{
    protected $table = 'housing_info';
    protected $fillable = ['address', 'zipcode', 'city', 'price', 'price_type', 'description', 'build_year', 'build_type', 'house_type'];
}
