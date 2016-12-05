@extends('layout.app')
@section('content')

<div class="col-sm-6 col-md-offset-3" ng-controller = "mainCtrl">
    <br/>
    <br/>
    <h2 class="ng-binding">Welcome to Contact List</h2>
    <div class="ibox">
    <br/>
        <div class="ibox-content ng-scope" >

            <form role="form" name="signupForm" novalidate ng-submit=" signupForm.$valid && edit()">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" placeholder="name" class="form-control input-lg" name="name" ng-model="acc.name" required>
                    <div class="help-block m-b-none computed" ng-show="signupForm.$submitted || signupForm.name.$touched">
                         <span class="text-danger" ng-show = "signupForm.name.$error.required">This field is required</span>
                         </div>
                    <div class="help-block m-b-none computed" ng-show="errors.name">
                         <span class="text-danger" ng-show = "errors.name">@{{ errors.name.toString() }}</span>
                    </div>
                </div>

                <div class="form-group">
                    <label>Email</label>
                    <input type="email" placeholder="Enter email" class="form-control input-lg" name="email" ng-model="acc.email" required>
                    <div class="help-block m-b-none computed" ng-show="signupForm.$submitted || signupForm.email.$touched">
                         <span class=" text-danger" ng-show = "signupForm.email.$error.required">This field is required</span>
                         <span class="text-danger" ng-show = "signupForm.email.$error.email">Please enter a valid Email Address</span>
                         </div>
                    <div class="help-block m-b-none computed" ng-show="errors.email">
                         <span class="text-danger" ng-show = "errors.email">@{{ errors.email.toString() }}</span>
                    </div>
                </div>

                <div class="form-group">
                    <button class="btn btn-sm btn-primary" type="submit"><strong> <i class = "fa fa-floppy-o"></i> Submit form</strong></button>
                </div>
            </form>
        </div>
    </div>
</div>


@endsection