
function config($stateProvider,  $ocLazyLoadProvider, IdleProvider, KeepaliveProvider, $httpProvider,$sceProvider)
{

  //$sceProvider.enabled(false);

  $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

  $httpProvider.interceptors.push('httpReponseInterceptor');

	//$urlRouterProvider,
	IdleProvider.idle(5); // in seconds
	IdleProvider.timeout(120); // In seconds

	/*$lRurouterProvider.otherwise("/");

	/*$ocLazyLoadProvider.config({
		debug: false
	}); 

	$stateProvider
		.state('/', {
			url: "/",
			data: { "pageTitle": "Welcome to Nigeria's No. 1 Payroll Management Software" }
		})
		.state('dashboard', {
           // abstract: true,
           	data: { pageTitle: "Customer Dashboard" },
            url: "/dashboard",
            templateUrl: "dashboard.html",
        })
        .state('insert', {
           // abstract: true,
           	data: { pageTitle: "AA New User" },
            url: "/insert",
            templateUrl: "insert.html",
        })
        .state('insert2', {
           // abstract: true,
           	data: { pageTitle: "AA New User" },
            url: "/insert2",
            templateUrl: "insert.html",
        })
        .state('states', {
           // abstract: true,
           	data: { pageTitle: "States" },
            url: "/states",
            templateUrl: "states.html",
        })
		.state('add_staff', {
			url: "/add_staff",
			templateUrl: "add_staff.html",
			data: { pageTitle: "Add Staff" }
		}); */
}

angular
    .module('payroll')
    .config(config)
    .run(function($rootScope, $state) {
        $rootScope.$state = $state;
  });
