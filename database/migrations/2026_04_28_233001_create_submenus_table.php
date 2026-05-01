<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submenus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_id')->constrained('menus')->cascadeOnDelete();
            $table->string('submenu_nombre');
            $table->string('submenu_funcion')->unique();
            $table->unsignedInteger('submenu_orden')->default(0);
            $table->boolean('submenu_mostrar')->default(true);
            $table->tinyInteger('submenu_estado')->default(1);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submenus');
    }
};
