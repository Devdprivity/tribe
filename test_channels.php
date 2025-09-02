<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Channel;

echo "=== Test de Canales Favoritos ===\n";

$user = User::first();
if ($user) {
    echo "Usuario: " . $user->name . "\n";
    
    $channels = Channel::whereHas('members', function($q) use ($user) {
        $q->where('user_id', $user->id);
    })->withCount('members as members_count')->get();
    
    echo "Canales favoritos: " . $channels->count() . "\n";
    foreach($channels as $c) {
        echo "- " . $c->name . " (" . $c->members_count . " miembros)\n";
    }
} else {
    echo "No hay usuarios\n";
}

echo "\n=== Test de Slug ===\n";
$channel = Channel::where('name', 'Experto')->first();
if ($channel) {
    echo "Canal: " . $channel->name . "\n";
    echo "Slug: " . $channel->slug . "\n";
    echo "URL esperada: /channels/" . $channel->slug . "\n";
} else {
    echo "Canal 'Experto' no encontrado\n";
}
