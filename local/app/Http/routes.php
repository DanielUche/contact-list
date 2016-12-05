<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

$app->get('/', function () use ($app) {
    return View('home.index');
});

$app->get('/list','HomeController@account_list');
$app->get('/create','HomeController@create');
$app->post('/create','HomeController@create');

$app->get('/edit','HomeController@update');
$app->post('/update','HomeController@update');
$app->post('/delete','HomeController@delete');

$app->post('/save-contact','HomeController@save_contact');