<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->string('menu_nombre');
            $table->string('menu_funcion')->unique();
            $table->unsignedInteger('menu_orden')->default(0);
            $table->string('menu_icono', 100)->nullable();
            $table->boolean('menu_mostrar')->default(true);
            $table->tinyInteger('menu_estado')->default(1);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};
