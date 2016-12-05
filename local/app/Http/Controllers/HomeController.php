<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Validator;

use App\Account;

class HomeController extends Controller
{

    public function __construct()
    {
        //
    }

    public function account_list(){
        $acc = Account::get();
        return View('home.list')->with('accounts',$acc);
    }

    public function create(Request $request){
        if($request->isMethod('post')) {
            $validate = Validator::make($request->all(), Account::$rules);
            if($validate->passes()){
                Account::saveRecord($request);
               return response()->json(['success'=>'Contact Saved Successfully']);
            }else{
                 return response()->json(['errors'=> $validate->messages()]);
            }
        }    
        return View('home.new');
    }

    public function update(Request $request){
        if($request->isMethod('post')) {
            $validate = Validator::make($request->all(), Account::rules_onUpdate($request->input('id')));
            if($validate->passes()){
                Account::updateRecord($request, $request->input('id'));
               return response()->json(['success'=>'Contact Updated Successfully']);
            }else{
                 return response()->json(['errors'=> $validate->messages()]);
            }
        }  else{  
        $acc = Account::findorFail($request->id);
        return response()->json($acc);
       // return View('home.edit')->withInput('name','Daniel');
    }
}

public function delete(Request $request){
        if($request->isMethod('post')) {
            $del = Account::deleteRecord($request->input('id'));
            if($del){
                return response()->json(['success'=>'Contact Deleted Successfully']);
            }
       }
    }
}
