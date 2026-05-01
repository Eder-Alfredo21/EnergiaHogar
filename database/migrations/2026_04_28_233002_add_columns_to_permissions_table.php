<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('permissions', function (Blueprint $table) {
            $table->foreignId('menu_id')
                ->nullable()
                ->after('guard_name')
                ->constrained('menus')
                ->nullOnDelete();

            $table->foreignId('submenu_id')
                ->nullable()
                ->after('menu_id')
                ->constrained('submenus')
                ->nullOnDelete();

            // 1 = Menú | 2 = Submenú | 3 = Acciones
            $table->tinyInteger('permissions_group')
                ->nullable()
                ->after('submenu_id');

            // ID del menú o submenú al que pertenece este permiso
            $table->unsignedBigInteger('permissions_group_id')
                ->nullable()
                ->after('permissions_group');

            $table->tinyInteger('permission_status')
                ->default(1)
                ->after('permissions_group_id');
        });
    }

    public function down(): void
    {
        Schema::table('permissions', function (Blueprint $table) {
            $table->dropForeign(['menu_id']);
            $table->dropForeign(['submenu_id']);
            $table->dropColumn([
                'menu_id',
                'submenu_id',
                'permissions_group',
                'permissions_group_id',
                'permission_status',
            ]);
        });
    }
};
