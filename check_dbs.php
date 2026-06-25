<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$dbs = DB::select('SHOW DATABASES');
foreach ($dbs as $db) {
    $name = $db->Database;
    echo "DB: {$name}" . PHP_EOL;
    try {
        // Query tables
        $tables = DB::select("SHOW TABLES FROM `{$name}`");
        foreach ($tables as $table) {
            $t = array_values((array)$table)[0];
            try {
                $count = DB::table("{$name}.{$t}")->count();
                echo "  -> Table: {$t}, Count: {$count}" . PHP_EOL;
            } catch (\Exception $e) {
                echo "  -> Table: {$t}, Error: " . $e->getMessage() . PHP_EOL;
            }
        }
    } catch (\Exception $e) {
        echo "  -> Error: " . $e->getMessage() . PHP_EOL;
    }
}
