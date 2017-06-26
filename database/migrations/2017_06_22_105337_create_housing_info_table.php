<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateHousingInfoTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('housing_info', function (Blueprint $table) {
            $table->increments('id');
            $table->string('address');
            $table->string('zipcode');
            $table->string('city');
            $table->string('price');
            $table->string('price_type');
            $table->text('description');
            $table->string('build_year');
            $table->string('build_type');
            $table->string('house_type');
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
        Schema::dropIfExists('housing_info');
    }
}
