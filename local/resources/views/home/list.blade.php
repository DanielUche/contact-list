@extends('layout.app')
@section('content')

    <div class="col-sm-6 col-md-offset-3" ng-controller = "mainCtrl">
     <br/>
        <br/>
        <h2 class="ng-binding">MyContact</h2>
        <div class="ibox">
        <br/>
                <div class="ibox-content" style="padding:0px">
                <table class="table table-strpied table-hover">
                	<tr>
                		<th>#</th>
                		<th>Name</th>
                		<th>Email</th>
                        <th>Actions</th>
                	</tr>
                    <tr  ng-show="is_edit==true">
                        <td class="" colspan="4">
                    <form role="form" name="signupForm" novalidate ng-submit=" signupForm.$valid && update(acc.id)">
                    <div class="col-sm-4">
                        <div class="form-group computed">
                            <label>Name</label>
                            <input type="hidden" name="id" ng-model="acc.id" required>
                            <input type="text" placeholder="name" class="form-control input-sm" name="name" ng-model="acc.name" required>
                            <div class="help-block m-b-none computed" ng-show="signupForm.$submitted || signupForm.name.$touched">
                                 <span class="text-danger" ng-show = "signupForm.name.$error.required">This field is required</span>
                                 </div>
                            <div class="help-block m-b-none computed" ng-show="errors.name">
                                 <span class="text-danger" ng-show = "errors.name">@{{ errors.name.toString() }}</span>
                            </div>
                        </div>
                    </div>

                    <div class = "col-sm-5">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" placeholder="Enter email" class="form-control input-sm" name="email" ng-model="acc.email" required>
                            <div class="help-block m-b-none computed" ng-show="signupForm.$submitted || signupForm.email.$touched">
                                 <span class=" text-danger" ng-show = "signupForm.email.$error.required">This field is required</span>
                                 <span class="text-danger" ng-show = "signupForm.email.$error.email">Please enter a valid Email Address</span>
                            </div>
                            <div class="help-block m-b-none computed" ng-show="errors.email">
                                 <span class="text-danger" ng-show = "errors.email">@{{ errors.email.toString() }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-3">
                     <div class="form-group"><br/>
                            <button class="btn btn-sm btn-success" type="submit"><strong> <i class = "fa fa-floppy-o"></i> Update</strong></button>
                        </div>
                        
                    </div>
                       
                </form>
                        </td>
                    </tr>
                	@foreach($accounts as $key => $a)
                	<tr>
                		<td>{{ $key+1 }}</td>
                		<td>{{$a->name}}</td>
                		<td>{{$a->email}}</td>
                        <td>
                            <button class ="btn btn-sm btn-danger" ng-click = "delete({{$a->id}})"> Delete  </button> 
                            <button ng-click = "edit({{ $a->id }})" class ="btn btn-sm btn-success" > Edit  </button> 
                        </td>
                	</tr>
                	@endforeach
                </table>
                </div>
            </div>
    </div>


@endsection