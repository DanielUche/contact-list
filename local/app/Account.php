<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    protected $fillable = [
        'name', 'email',
    ];

    public $incrementing = true;

    public static $rules = ['email'=>'required|email|bail|unique:accounts','name'=>'required|bail'];

    protected static function rules_onUpdate($id) {
    return  ['email'=>'bail|required|email|unique:accounts,email,'.$id,'name'=>'bail|required'];
    }

    static function saveRecord($requset){
        return Account::create($requset->all());
    }

    static function deleteRecord($id){
        return Account::where('id',$id)->delete();
    }

    static function updateRecord($requset, $id){
        $acc = Account::where('id',$id)->first();
        $acc->email = $requset->input('email');
        $acc->name = $requset->input('name');
        $acc->save();
    }
}
