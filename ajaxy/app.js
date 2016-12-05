'use strict';
(function(){
	angular.module('contact',['ngResource',
		'toaster', 'ngAnimate' ,'ui.bootstrap'
	]).constant('APP_URL', '/lumen/');
})();


function mainCtrl($scope,$http,toaster,APP_URL){

$scope.acc = {};
$scope.is_edit = false;
$scope.errors = {};

	$scope.signup = function(){
		if($scope.signupForm.$valid){
			$http({
				method:"post",
				url : APP_URL + "create",
				data: $.param($scope.acc),
				headers: {'Content-Type':'application/x-www-form-urlencoded'},
			}).then(function(res){
				if(res.data.success){
	                toaster.success(res.data.success);
	                $scope.acc = {};
	                $scope.signupForm.$setPristine(); $scope.signupForm.$setUntouched(); 
	            }else{
	                $scope.errors = res.data.errors;
	            }
			},function(){});
		}
	}

	$scope.update = function(id){
		if($scope.signupForm.$valid){
			$http({
				method:"post",
				url : APP_URL + "update",
				data: $.param($scope.acc),
				headers: {'Content-Type':'application/x-www-form-urlencoded'},
			}).then(function(res){
				if(res.data.success){
	                toaster.success(res.data.success);
	                $scope.acc = {};
	                $scope.signupForm.$setPristine(); $scope.signupForm.$setUntouched(); 
	                $scope.is_edit =false;
	                location.reload();
	            }else{
	                $scope.errors = res.data.errors;
	            }
			},function(){});
		}
	}

	$scope.delete = function(id){
			$http({
				method:"post",
				url : APP_URL + "delete",
				data: $.param({id:id}),
				headers: {'Content-Type':'application/x-www-form-urlencoded'},
			}).then(function(res){
				if(res.data.success){
	                toaster.success(res.data.success);
	                $scope.acc = {};
	                location.reload();
	            }else{
	                $scope.errors = res.data.errors;
	            }
			},function(){});
	}

	$scope.edit = function(id){
		$scope.is_edit = false;
		$http.get(APP_URL +'edit?id='+id).then(function(res){
			$scope.acc = res.data;
			$scope.is_edit = true;
		});
	}
}

function config($httpProvider,$sceProvider){
	$httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
}

angular
.module('contact')
.config(config);

angular
.module('contact')
.controller('mainCtrl',mainCtrl)