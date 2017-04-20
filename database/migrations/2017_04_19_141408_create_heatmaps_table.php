<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateHeatmapsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('heatmaps', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('scene_number');
            $table->string('position_x');
            $table->string('position_y');
            $table->string('position_z');
            $table->string('hex_color');
            $table->integer('radius');
            $table->string('opacity');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('heatmaps');
    }
}
