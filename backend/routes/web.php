<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['message' => 'API is running']);
});

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::get('/.well-known/mta-sts.txt', function () {
    return response("version: STSv1\nmode: enforce\nmx: mail.pyxyll.com\nmax_age: 604800\n", 200)
        ->header('Content-Type', 'text/plain');
});
